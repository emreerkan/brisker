import type { Player, GeolocationData } from '@/types';
import { updatePlayerIDFromServer } from '@/utils/localStorage';
import { getGeolocation } from '@/utils/deviceUtils';

// Resolve WebSocket endpoint from environment
const resolveWebSocketURL = (): string => {
  const isDev = import.meta.env.DEV;
  const key = isDev ? 'VITE_WS_DEV_URL' : 'VITE_WS_PROD_URL';
  const raw = (import.meta.env[key as keyof ImportMetaEnv] as string | undefined)?.trim();

  if (!raw) {
    throw new Error(`Missing required environment variable ${key}. Define it in your Vite environment configuration.`);
  }

  if (!/^wss?:\/\//i.test(raw)) {
    throw new Error(`${key} must include the protocol (ws:// or wss://). Received: ${raw}`);
  }

  return raw;
};

const WEBSOCKET_URL = resolveWebSocketURL();

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
  | 'players:search_results'
  | 'players:nearby_results';

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
  // Track the active WebSocket handshake so multiple callers share the same promise
  private static activeConnectPromise: Promise<string> | null = null;
  // Prevent duplicate handshake messages on the same socket
  private static handshakeInitiated = false;
  private static handshakeResolved = false;
  private static lastKnownLocation: GeolocationData | null = null;
  private static locationSyncInFlight: Promise<void> | null = null;
  private static lastLocationSyncMs = 0;
  private static readonly LOCATION_REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  
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
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.currentPlayerID) {
      return this.currentPlayerID;
    }

    if (this.activeConnectPromise) {
      return this.activeConnectPromise;
    }

    this.activeConnectPromise = new Promise((resolve, reject) => {
      let settled = false;
      let handshakeTimeout: ReturnType<typeof setTimeout> | undefined;

      const clearHandshakeTimeout = () => {
        if (handshakeTimeout !== undefined) {
          clearTimeout(handshakeTimeout);
          handshakeTimeout = undefined;
        }
      };

      const resolveOnce = (playerID: string) => {
        if (settled) return;
        settled = true;
        clearHandshakeTimeout();
        this.handshakeResolved = true;
        this.activeConnectPromise = null;
        resolve(playerID);
      };

      const rejectOnce = (error: Error) => {
        if (settled) return;
        settled = true;
        clearHandshakeTimeout();
        this.activeConnectPromise = null;
        reject(error);
      };

      // Always start with a fresh socket for a new handshake attempt
      if (this.ws) {
        const previousSocket = this.ws;
        this.ws = null;
        previousSocket.onclose = null;
        previousSocket.onmessage = null;
        previousSocket.onerror = null;
        previousSocket.onopen = null;
        try { previousSocket.close(); } catch (err) { /* ignore */ }
      }

      try {
        this.ws = new WebSocket(WEBSOCKET_URL);
      } catch (err) {
        rejectOnce(err instanceof Error ? err : new Error('Failed to initialize WebSocket connection'));
        return;
      }

      const socket = this.ws!;
      this.handshakeInitiated = false;
      this.handshakeResolved = false;

      socket.onopen = () => {
        console.log('WebSocket connected to game server');
        // Server will send connection:established message
      };

      socket.onmessage = (event) => {
        try {
          const message: WebSocketEvent = JSON.parse(event.data);
          console.log('WebSocket message received:', message);

          // Handle connection established - decide if we need new ID or reconnect
          if (message.type === 'connection:established') {
            if (this.handshakeInitiated) {
              console.log('Ignoring duplicate connection:established message');
              return;
            }

            this.handshakeInitiated = true;
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
            void this.syncLocationWithServer(true);
            resolveOnce(message.payload.playerID);
            return;
          }

          // Handle successful reconnection
          if (message.type === 'player:reconnected') {
            if (this.handshakeResolved && this.currentPlayerID === message.payload.playerID) {
              console.log('Ignoring duplicate player:reconnected message');
              return;
            }

            this.currentPlayerID = message.payload.playerID;
            console.log('Successfully reconnected with player ID:', message.payload.playerID);

            // Do not automatically request the full players list on reconnect; rely on explicit user search.
            // Notify listeners about successful reconnection
            const rcHandlers = this.eventHandlers.get('player:reconnected') || [];
            rcHandlers.forEach(h => {
              try { h(message.payload); } catch (e) { console.error('player:reconnected handler error', e); }
            });
            void this.syncLocationWithServer(true);
            resolveOnce(message.payload.playerID);
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

      socket.onclose = () => {
        clearHandshakeTimeout();
        console.log('WebSocket disconnected from game server');

        // Store previous ID before clearing it
        const prevID = this.currentPlayerID;

        // Clear connection state
        this.ws = null;
        this.currentPlayerID = null;
        this.handshakeInitiated = false;
        this.handshakeResolved = false;

        // Notify listeners about going offline
        const offlineHandlers = this.eventHandlers.get('player:offline') || [];
        offlineHandlers.forEach(h => {
          try {
            h({ playerID: prevID });
          } catch (e) {
            console.error('player:offline handler error', e);
          }
        });

        if (!settled) {
          rejectOnce(new Error('WebSocket closed before handshake completed'));
        }

        // Start reconnection attempts (only if not already trying)
        if (!this.connectingPromise) {
          this.startReconnectLoop(250, 12).catch(e => {
            console.warn('All reconnection attempts failed, working in offline mode:', e.message);
            // Game will continue in offline mode
          });
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        const err = error instanceof Error ? error : new Error('WebSocket error');
        rejectOnce(err);
        try { socket.close(); } catch (closeErr) { /* ignore */ }
      };

      // Timeout after 5 seconds for individual connection attempts
      handshakeTimeout = setTimeout(() => {
        if (!this.handshakeResolved) {
          rejectOnce(new Error('WebSocket connection timeout'));
          try { socket.close(); } catch (err) { /* ignore */ }
        }
      }, 5000);
    });

    return this.activeConnectPromise;
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
  static searchPlayersByLocation(location: GeolocationData, radiusKm: number = 5): Promise<Player[]> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.ensureConnectedShort();
      } catch (error) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      let timeoutId: ReturnType<typeof setTimeout>;

      const cleanup = () => {
        this.removeEventListener('players:nearby_results', handleNearbyResults);
        if (timeoutId) clearTimeout(timeoutId);
      };

      const handleNearbyResults = (payload: any) => {
        const players = Array.isArray(payload?.players) ? payload.players : [];
        const mapped: Player[] = players.map((player: any) => ({
          playerID: player.playerID,
          name: player.name,
          distance: typeof player.distance === 'number' ? player.distance : undefined,
          isOnline: player.isOnline,
        }));
        cleanup();
        resolve(mapped);
      };

      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Nearby search timed out'));
      }, 7000);

      this.addEventListener('players:nearby_results', handleNearbyResults);

      this.sendMessage({
        type: 'players:nearby',
        payload: {
          latitude: location.latitude,
          longitude: location.longitude,
          radiusKm,
        },
      });
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
    this.lastKnownLocation = location;
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
    const payload: typeof state = { ...state };
    if (!payload.location && this.lastKnownLocation) {
      payload.location = this.lastKnownLocation;
    }
    this.sendMessage({ type: 'player:state_update', payload });
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

  private static async syncLocationWithServer(force: boolean = false): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    const now = Date.now();
    if (!force && now - this.lastLocationSyncMs < this.LOCATION_REFRESH_INTERVAL_MS) {
      return;
    }

    if (this.locationSyncInFlight) {
      return this.locationSyncInFlight;
    }

    this.locationSyncInFlight = (async () => {
      try {
        const position = await getGeolocation();
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        this.lastKnownLocation = location;
        this.lastLocationSyncMs = Date.now();
        this.updatePlayerLocation(location);
      } catch (error) {
        console.warn('Unable to obtain geolocation for server sync:', error);
      } finally {
        this.locationSyncInFlight = null;
      }
    })();

    return this.locationSyncInFlight;
  }
}
