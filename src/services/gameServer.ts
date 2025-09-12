import type { Player, GeolocationData } from '@/types';
import { updatePlayerIDFromServer } from '@/utils/localStorage';

// WebSocket server URL - hardcoded for network testing
const getWebSocketURL = () => {
  const host = '192.168.68.102:3000'; // Network IP for testing
  
  // Force ws:// for IP addresses since SSL certificates don't work with IPs
  // Use wss:// only for localhost where we have a valid certificate
  if (host.includes('localhost')) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${host}`;
  } else {
    // For IP addresses, always use ws:// (non-secure WebSocket)
    return `ws://${host}`;
  }
};

const WEBSOCKET_URL = getWebSocketURL();

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
  | 'game:apply_brisks'
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
  | 'players:list'
  | 'players:search_results';

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
              // Request new player ID with current player name
              console.log('Requesting new player ID');
              this.sendMessage({
                type: 'player:request_id',
                payload: { 
                  name: playerSettings.name || ''
                }
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
        
        // Store previous ID before clearing it
        const prevID = this.currentPlayerID;
        
        // Clear connection state
        this.ws = null;
        this.currentPlayerID = null;
        
        // Notify listeners about going offline
        const offlineHandlers = this.eventHandlers.get('player:offline') || [];
        offlineHandlers.forEach(h => {
          try { 
            h({ playerID: prevID }); 
          } catch (e) { 
            console.error('player:offline handler error', e); 
          }
        });
        
        // Start reconnection attempts (only if not already trying)
        if (!this.connectingPromise) {
          this.startReconnectLoop(250, 12).catch(e => {
            console.warn('All reconnection attempts failed, working in offline mode:', e.message);
            // Game will continue in offline mode
          });
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
      
      // Timeout after 5 seconds for individual connection attempts
      setTimeout(() => {
        if (!this.currentPlayerID) {
          reject(new Error('WebSocket connection timeout'));
        }
      }, 5000);
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
          console.warn('WebSocket not connected and reconnect failed, working in offline mode. Cannot send message:', message.type || '[unknown]');
          return;
        }
      }

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify(message));
          console.log('⬆️ Sent WS message:', message.type || '[unknown]');
        } catch (e) {
          console.warn('Failed to send WS message, falling back to offline mode:', e, message);
        }
      } else {
        console.warn('WebSocket not available, working in offline mode. Message not sent:', message.type || '[unknown]');
      }
    })();
  }

  // Try to connect with short backoff for immediate user actions
  private static async ensureConnectedShort(): Promise<void> {
    // If already connected, return immediately
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }
    
    // If a reconnection attempt is already in progress, wait for it
    if (this.connectingPromise) {
      try {
        await this.connectingPromise;
        return;
      } catch (e) {
        // Reconnection attempt failed, server appears offline
        throw new Error('Connection attempt failed, server appears offline');
      }
    }

    // Start a quick reconnection attempt (3 attempts, 500ms delay)
    try {
      await this.startReconnectLoop(500, 3);
    } catch (e) {
      throw new Error('Unable to connect to server for user action');
    }
  }

  // Start a short reconnect loop with intervalMs and maxAttempts.
  // This is intended for automatic quick recovery after disconnection (e.g., reloads).
  private static async startReconnectLoop(intervalMs: number = 250, maxAttempts: number = 12): Promise<string> {
    // If already connected, return immediately
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.currentPlayerID) {
      return this.currentPlayerID;
    }
    
    // If already trying to connect, wait for that attempt
    if (this.connectingPromise) {
      try {
        return await this.connectingPromise;
      } catch (e) {
        // Previous attempt failed, we'll start a new one below
      }
    }

    // Create the reconnection attempt promise
    this.connectingPromise = this.performReconnectionAttempts(intervalMs, maxAttempts);
    
    try {
      const result = await this.connectingPromise;
      return result;
    } finally {
      // Always clear the promise when done (success or failure)
      this.connectingPromise = null;
    }
  }

  // Perform the actual reconnection attempts
  private static async performReconnectionAttempts(intervalMs: number, maxAttempts: number): Promise<string> {
    console.log(`Starting reconnection attempts (${maxAttempts} attempts with ${intervalMs}ms delay)`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Reconnection attempt ${attempt}/${maxAttempts}`);
        const id = await this.connectWebSocket();
        console.log(`Successfully reconnected on attempt ${attempt}, player ID: ${id}`);
        return id;
      } catch (e) {
        console.warn(`Reconnection attempt ${attempt}/${maxAttempts} failed:`, e);
        
        // Wait between attempts (except after the last one)
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
      }
    }
    
    // All attempts failed
    const error = new Error(`Failed to reconnect after ${maxAttempts} attempts. Server appears to be offline.`);
    console.error(error.message);
    throw error;
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
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      // Set up one-time listener for search results
      const handleSearchResults = (payload: any) => {
        const players = payload.players || [];
        const results: Player[] = players.map((player: any) => ({
          playerID: player.playerID,
          name: player.name,
          isOnline: player.isOnline
        }));
        
        // Remove the listener after getting results
        this.removeEventListener('players:search_results', handleSearchResults);
        resolve(results);
      };

      // Add temporary listener for search results
      this.addEventListener('players:search_results', handleSearchResults);

      // Send search request to server
      this.sendMessage({
        type: 'players:search',
        payload: { searchTerm }
      });

      // Set timeout to avoid hanging indefinitely
      setTimeout(() => {
        this.removeEventListener('players:search_results', handleSearchResults);
        reject(new Error('Search request timed out'));
      }, 5000);
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

  // Instruct opponent to add remaining brisk points (used for brisk complement)
  static applyBrisksToOpponent(opponentID: string, briskCount: number): void {
    const payload = { opponentID, briskCount };
    this.sendMessage({ type: 'game:apply_brisks', payload });
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

  // Check if we're currently connected to the server
  static isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN && this.currentPlayerID !== null;
  }

  // Check if we're currently in offline mode
  static isOffline(): boolean {
    return !this.isConnected();
  }

  // Network testing utilities
  static getCurrentServerURL(): string {
    return getWebSocketURL();
  }

  static getConfiguredServerHost(): string {
    return '192.168.68.102:3000';
  }
}
