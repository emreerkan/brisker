import type { Player, GeolocationData } from '../types/game';

// Mock Game Server URL - will be replaced with real server later
// const GAME_SERVER_URL = 'https://mock-game-server.example.com/api';

// Mock delay to simulate network requests
const mockDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Mock players database for testing
const mockPlayers: Player[] = [
  { playerID: 'player_123_abc', name: 'Alice' },
  { playerID: 'player_456_def', name: 'Bob' },
  { playerID: 'player_789_ghi', name: 'Charlie' },
  { playerID: 'player_321_jkl', name: 'Diana' },
  { playerID: 'player_654_mno', name: 'Eve' },
];

// Mock geolocation players - would be based on actual location in real implementation
const mockGeoPlayers: Player[] = [
  { playerID: 'player_111_xyz', name: 'NearbyPlayer1', distance: 0.5 },
  { playerID: 'player_222_uvw', name: 'NearbyPlayer2', distance: 1.2 },
  { playerID: 'player_333_rst', name: 'NearbyPlayer3', distance: 2.1 },
];

export class GameServerAPI {
  // Search for players by player ID
  static async searchPlayersByID(searchTerm: string): Promise<Player[]> {
    await mockDelay(800); // Simulate network delay
    
    try {
      // Mock API call - in real implementation, this would be:
      // const response = await fetch(`${GAME_SERVER_URL}/players/search?q=${searchTerm}`);
      // const players = await response.json();
      
      // For now, filter mock data
      const filteredPlayers = mockPlayers.filter(player =>
        player.playerID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      return filteredPlayers.slice(0, 5); // Return max 5 results
    } catch (error) {
      console.error('Failed to search players:', error);
      throw new Error('Failed to search players');
    }
  }

  // Search for nearby players by geolocation
  static async searchPlayersByLocation(location: GeolocationData): Promise<Player[]> {
    await mockDelay(1200); // Simulate network delay
    
    try {
      // Mock API call - in real implementation, this would be:
      // const response = await fetch(`${GAME_SERVER_URL}/players/nearby`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ latitude: location.latitude, longitude: location.longitude })
      // });
      // const players = await response.json();
      
      // For now, return mock nearby players
      console.log('Searching near location:', location);
      return mockGeoPlayers;
    } catch (error) {
      console.error('Failed to search nearby players:', error);
      throw new Error('Failed to search nearby players');
    }
  }

  // Register player with server (would be used to get initial playerID from server)
  static async registerPlayer(_name: string): Promise<string> {
    await mockDelay(500);
    
    try {
      // Mock API call - in real implementation, this would be:
      // const response = await fetch(`${GAME_SERVER_URL}/players/register`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name })
      // });
      // const result = await response.json();
      // return result.playerID;
      
      // For now, generate a mock server-style ID (name param will be used in real implementation)
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 8);
      return `srv_${timestamp}_${randomStr}`;
    } catch (error) {
      console.error('Failed to register player:', error);
      throw new Error('Failed to register with server');
    }
  }

  // Update player name on server
  static async updatePlayerName(playerID: string, name: string): Promise<void> {
    await mockDelay(300);
    
    try {
      // Mock API call - in real implementation, this would be:
      // await fetch(`${GAME_SERVER_URL}/players/${playerID}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name })
      // });
      
      console.log(`Updated player ${playerID} name to: ${name}`);
    } catch (error) {
      console.error('Failed to update player name:', error);
      throw new Error('Failed to update player name');
    }
  }
}
