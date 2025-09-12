import type { Player, GeolocationData } from '../types/game';
import { updatePlayerIDFromServer } from '../utils/localStorage';

// WebSocket server URL - simplified architecture  
const WEBSOCKET_URL = window.location.protocol === 'https:' ? 'wss://localhost:3000' : 'ws://localhost:3000';

// Player discovery and game state types
export interface ConnectedPlayer {
  playerID: string;
  name: string;
  location?: { latitude: number; longitude: number };
  distance?: number;
  isOnline: boolean;
}



// WebSocket Event Types (matching server)
export type WebSocketEventType = 
  | 'connection:established'
  | 'game:created'
  | 'game:auto_joined' 
  | 'game:joined'
  | 'game:apply_points'
  | 'game:reset'
  | 'game:resume'
  | 'game:opponent_undo'
  | 'game:score_updated'
  | 'game:opponent_scored'
  | 'game:opponent_undo'
  | 'game:completed'
  | 'player:online'
  | 'player:offline'
  | 'player:id_assigned'
  | 'player:reconnected'
  | 'player:invalid_id'
  | 'player:name_changed'
  | 'players:list';

export interface WebSocketEvent {
  type: WebSocketEventType;
  payload: any;
}

export class GameServerAPI {
  private static ws: WebSocket | null = null;
  private static eventHandlers = new Map<WebSocketEventType, ((payload: any) => void)[]>();
  private static connectedPlayers = new Map<string, ConnectedPlayer>();
  private static currentPlayerID: string | null = null;
  // Guard against parallel connect attempts which can spam the server
  private static connectingPromise: Promise<string> | null = null;
  
  // Get stored player ID from localStorage
  private static getStoredPlayerID(): string | null {
    return localStorage.getItem('bezique_player_id');
  }

  // Store player ID to localStorage
  private static storePlayerID(playerID: string): void {
    localStorage.setItem('bezique_player_id', playerID);
  }

  // WebSocket connection management
  static async connectWebSocket(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN && this.currentPlayerID) {
        resolve(this.currentPlayerID);
        return;
      }
      
      this.ws = new WebSocket(WEBSOCKET_URL);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected to game server');
        // Server will send connection:established message
      };
      
      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketEvent = JSON.parse(event.data);
          console.log('WebSocket message received:', message);
          
          // Handle connection established - decide if we need new ID or reconnect
          if (message.type === 'connection:established') {
            const storedPlayerID = this.getStoredPlayerID();
            const playerSettings = JSON.parse(localStorage.getItem('bezique_player_settings') || '{}');
            
            if (storedPlayerID && /^\d{4}$/.test(storedPlayerID)) {
              // Reconnect with existing player ID
              console.log('Reconnecting with existing player ID:', storedPlayerID);
              this.sendMessage({
                type: 'player:reconnect',
                payload: { 
                  playerID: storedPlayerID,
                  name: playerSettings.name || `Player ${storedPlayerID}`
                }
              });
            } else {
              // Request new player ID
              console.log('Requesting new player ID');
              this.sendMessage({
                type: 'player:request_id',
                payload: {}
              });
            }
            // Notify any registered handlers that a low-level connection has been established
            const connHandlers = this.eventHandlers.get('connection:established') || [];
            connHandlers.forEach(h => {
              try { h(message.payload); } catch (e) { console.error('connection:established handler error', e); }
            });
            return;
          }
          
          // Handle new player ID assignment
          if (message.type === 'player:id_assigned') {
            this.currentPlayerID = message.payload.playerID;
            this.storePlayerID(message.payload.playerID);
            
            // Update player settings with new ID
            updatePlayerIDFromServer(message.payload.playerID);
            
            console.log('New player ID assigned:', message.payload.playerID);
            
            // Do not automatically request the full players list here; use explicit search when the user needs it.
            // Call any listeners for id assignment
            const idHandlers = this.eventHandlers.get('player:id_assigned') || [];
            idHandlers.forEach(h => {
              try { h(message.payload); } catch (e) { console.error('player:id_assigned handler error', e); }
            });
            resolve(message.payload.playerID);
            return;
          }
          
          // Handle successful reconnection
          if (message.type === 'player:reconnected') {
            this.currentPlayerID = message.payload.playerID;
            console.log('Successfully reconnected with player ID:', message.payload.playerID);
            
            // Do not automatically request the full players list on reconnect; rely on explicit user search.
            // Notify listeners about successful reconnection
            const rcHandlers = this.eventHandlers.get('player:reconnected') || [];
            rcHandlers.forEach(h => {
              try { h(message.payload); } catch (e) { console.error('player:reconnected handler error', e); }
            });
            resolve(message.payload.playerID);
            return;
          }
          
          // Handle invalid player ID
          if (message.type === 'player:invalid_id') {
            console.warn('Invalid player ID, requesting new one');
            // Clear stored ID and request new one
            localStorage.removeItem('bezique_player_id');
            this.sendMessage({
              type: 'player:request_id',
              payload: {}
            });
            return;
          }
          
          // Handle players list update
          if (message.type === 'players:list') {
            this.updateConnectedPlayers(message.payload.players.map((p: any) => ({
              playerID: p.playerID,
              name: p.name,
              isOnline: p.isOnline,
              location: p.location ? { latitude: p.location.y, longitude: p.location.x } : undefined
            })));
          }

          // Handle individual player name change events by updating our cache
          if (message.type === 'player:name_changed') {
            const { playerID, name } = message.payload || {};
            if (playerID && typeof name === 'string') {
              const existing = this.connectedPlayers.get(playerID);
              if (existing) {
                existing.name = name;
                this.connectedPlayers.set(playerID, existing);
              }
            }
          }
          
          // Handle other events
          const handlers = this.eventHandlers.get(message.type) || [];
          handlers.forEach(handler => handler(message.payload));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected from game server');
        // Let any listeners know we're offline (provide previous playerID if available)
        const prevID = this.currentPlayerID;
        const offlineHandlers = this.eventHandlers.get('player:offline') || [];
        offlineHandlers.forEach(h => {
          try { h({ playerID: prevID }); } catch (e) { console.error('player:offline handler error', e); }
        });
        this.ws = null;
        this.currentPlayerID = null;
        // Start a short reconnect loop so clients try to re-establish quickly
        // Guarded by connectingPromise to avoid parallel reconnect storms
        (async () => {
          try {
            await this.startReconnectLoop(250, 12);
          } catch (e) {
            console.warn('Short reconnect attempts exhausted or failed:', e);
          }
        })();
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
      
      // Timeout after 10 seconds (increased for the new handshake)
      setTimeout(() => {
        if (!this.currentPlayerID) {
          reject(new Error('WebSocket connection timeout'));
        }
      }, 10000);
    });
  }

  // Try to connect to server with polling until successful
  static async connectWithRetry(intervalMs: number = 1500, maxAttempts: number = 60): Promise<string> {
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        const id = await this.connectWebSocket();
        return id;
      } catch (e) {
        attempts++;
        // wait and retry
        await new Promise(res => setTimeout(res, intervalMs));
      }
    }
    throw new Error('Unable to connect to game server after retries');
  }
  
  static disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.currentPlayerID = null;
    }
  }
  
  static sendMessage(message: any): void {
    (async () => {
      // If not connected, try a short reconnect attempt so user actions restore the connection
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        try {
          await this.ensureConnectedShort();
        } catch (e) {
          console.warn('WebSocket not connected and reconnect failed, cannot send message:', message.type || '[unknown]');
          return;
        }
      }

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify(message));
          console.log('⬆️ Sent WS message:', message.type || '[unknown]');
        } catch (e) {
          console.warn('Failed to send WS message:', e, message);
        }
      }
    })();
  }

  // Try to connect with short backoff for immediate user actions
  private static async ensureConnectedShort(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
    // If a connect attempt is already in-flight, wait for it instead of starting another
    if (this.connectingPromise) {
      try {
        await this.connectingPromise;
        return;
      } catch (e) {
        // previous attempt failed; fall through to start a new one
      }
    }

    // Start a single short reconnect attempt and store the promise so parallel callers wait on it
    this.connectingPromise = this.connectWithRetry(500, 6);
    try {
      await this.connectingPromise;
    } finally {
      // Clear the guard regardless of success or failure so future attempts can proceed
      this.connectingPromise = null;
    }
  }

  // Start a short reconnect loop with intervalMs and maxAttempts.
  // This is intended for automatic quick recovery after disconnection (e.g., reloads).
  private static async startReconnectLoop(intervalMs: number = 250, maxAttempts: number = 12): Promise<string> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return Promise.resolve(this.currentPlayerID || '');
    // Prevent parallel reconnect loops
    if (this.connectingPromise) {
      try {
        return await this.connectingPromise;
      } catch (e) {
        // fallthrough to start a new loop
      }
    }

    let attempts = 0;
    // store the promise so concurrent callers wait on the same attempt
    this.connectingPromise = (async () => {
      while (attempts < maxAttempts) {
        try {
          const id = await this.connectWithRetry(intervalMs, 1);
          return id;
        } catch (e) {
          attempts++;
          // small delay between attempts
          await new Promise(res => setTimeout(res, intervalMs));
        }
      }
      throw new Error('startReconnectLoop: exhausted attempts');
    })();

    try {
      const result = await this.connectingPromise;
      return result;
    } finally {
      this.connectingPromise = null;
    }
  }
  
  static addEventListener(eventType: WebSocketEventType, handler: (payload: any) => void): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }
  
  static removeEventListener(eventType: WebSocketEventType, handler: (payload: any) => void): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Search for players by player ID
  static searchPlayersByID(searchTerm: string): Promise<Player[]> {
    return new Promise((resolve) => {
      const results: Player[] = [];
      
      this.connectedPlayers.forEach((player) => {
        // Exclude ourselves from search results
        if (player.playerID === this.currentPlayerID) return;

        if (player.playerID.toLowerCase().includes(searchTerm.toLowerCase()) ||
            player.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({
            playerID: player.playerID,
            name: player.name,
            isOnline: player.isOnline
          });
        }
      });
      
      resolve(results.slice(0, 5));
    });
  }

  // Search for nearby players by geolocation
  static searchPlayersByLocation(location: GeolocationData): Promise<Player[]> {
    return new Promise((resolve) => {
      const results: Player[] = [];
      
      this.connectedPlayers.forEach((player) => {
        // Exclude ourselves from nearby results
        if (player.playerID === this.currentPlayerID) return;
        if (player.location) {
          // Calculate distance (simple approximation)
          const distance = this.calculateDistance(
            location.latitude, location.longitude,
            player.location.latitude, player.location.longitude
          );
          
          if (distance <= 5) { // Within 5km
            results.push({
              playerID: player.playerID,
              name: player.name,
              distance: parseFloat(distance.toFixed(1)),
              isOnline: player.isOnline
            });
          }
        }
      });
      
      // Sort by distance
      results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      resolve(results.slice(0, 20));
    });
  }

  // Update player name
  static updatePlayerName(name: string): void {
    this.sendMessage({
      type: 'player:update_name',
      payload: { name }
    });
  }

  // Update player location
  static updatePlayerLocation(location: GeolocationData): void {
    this.sendMessage({
      type: 'player:update_location',
      payload: location
    });
  }

  // Start game with opponent
  static startGameWith(opponentID: string): void {
    // Prevent starting a game with ourselves
    if (!opponentID || opponentID === this.currentPlayerID) {
      console.warn('Ignoring attempt to start a game with self');
      return;
    }

    this.sendMessage({ type: 'game:start', payload: { opponentID } });
  }

  // Send score update to opponent
  static sendScoreUpdate(opponentID: string, score: number): void {
    this.sendMessage({
      type: 'game:score_update',
      payload: { opponentID, score }
    });
  }

  // Instruct opponent to apply points to their own total (used for brisk complement)
  static applyPointsToOpponent(opponentID: string, points: number, meta: Record<string, any> | null = null): void {
    const payload: any = { opponentID, points };
    if (meta) payload.meta = meta;
    this.sendMessage({ type: 'game:apply_points', payload });
  }

  // Send current player state to server for in-memory storage and resume handling
  static updatePlayerState(state: { playerID?: string; name?: string; history?: any[]; total?: number; opponentID?: string; location?: { latitude: number; longitude: number } }) {
    this.sendMessage({ type: 'player:state_update', payload: state });
  }

  // Request opponent to undo last entry (used for brisk undo coordination)
  static async requestUndoOpponent(opponentID: string, payload: { points: number; briskValue?: number } ) {
    console.log('🔁 Requesting opponent undo:', { to: opponentID, ...payload });
    // Ensure websocket is connected (best-effort)
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      try {
        await this.connectWebSocket();
      } catch (e) {
        console.warn('Could not connect websocket before requesting opponent undo:', e);
        // Still attempt to send (will warn inside sendMessage)
      }
    }

    this.sendMessage({ type: 'game:opponent_undo', payload: { opponentID, ...payload } });
  }

  // Utility: Calculate distance between two coordinates
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Request all players from server
  static requestAllPlayers(): void {
    this.sendMessage({
      type: 'players:get_all',
      payload: {}
    });
  }

  // Update connected players list (called when server sends player list)
  static updateConnectedPlayers(players: ConnectedPlayer[]): void {
    this.connectedPlayers.clear();
    players.forEach(player => {
      this.connectedPlayers.set(player.playerID, player);
    });
  }

  // Get current player ID
  static getCurrentPlayerID(): string | null {
    return this.currentPlayerID;
  }
}
