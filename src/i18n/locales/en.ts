import type { LanguageMeta, Translation } from '../types';

export const meta: LanguageMeta = {
  code: 'en',
  name: 'English',
};

const translation: Translation = {
  // Main UI
  brisk: 'Brisk',
  // Modal titles
  scoreHistory: 'Score History',
  settings: 'Settings',
  appInformation: 'App Information',
  resetScore: 'Reset Score',
  // Settings
  soundEffects: 'Sound Effects',
  language: 'Language',
  // History
  totalScore: 'Total Score',
  noScoresRecorded: 'No scores recorded yet',
  // Reset confirmation
  resetConfirmation: 'Reset Score',
  resetWarning: 'This will delete all scores and cannot be undone.',
  // Info modal
  appName: 'Brisker',
  version: 'Version',
  description: 'Score keeping application for the Bezique card game',
  features: 'Features',
  featureList: {
    scoreTracking: 'Score tracking and addition',
    undoLastScore: 'Undo last score',
    viewHistory: 'View score history',
    briskCalculation: 'Brisk calculation (brisk × 20)',
    soundEffects: 'Sound effects',
    resetGame: 'Reset game',
  },
  // Buttons
  close: 'Close',
  reset: 'Reset',
  cancel: 'Cancel',
  // Brisk popup
  selectBrisk: 'Select Brisk',
  briskDescription: 'Select brisk number (adds brisk × 20 points)',
  // Tooltips
  undoLastScoreTooltip: 'Undo last score',
  showScoreHistoryTooltip: 'Show score history',
  resetScoreTooltip: 'Reset score',
  settingsTooltip: 'Settings',
  appInformationTooltip: 'App information',
  // Info page
  developedBy: 'Developed by Emre Erkan with Claude Sonnet 4 and GitHub Copilot',
  buildDate: 'Build Date: September 2025',
  // Settings sections
  audioSection: 'Audio',
  // Congratulations
  congratulations: 'Congratulations!',
  youWin: 'You Win!',
  congratulationsMessage: "You've reached to 10,000 points! Fantastic game!",
  newGame: 'New Game',
  // Multiplayer
  playerID: 'Player ID',
  playerName: 'Player Name',
  copyPlayerID: 'Copy Player ID',
  sharePlayerID: 'Share Player ID',
  searchPlayers: 'Search Players',
  findNearbyPlayers: 'Find Nearby Players',
  editName: 'Edit Name',
  saveName: 'Save Name',
  enterPlayerName: 'Enter your player name',
  searchPlayersTitle: 'Search Players',
  enterPlayerID: 'Enter Player ID',
  enterPlayerIDOrName: 'Enter Player ID or Name...',
  searchingPlayers: 'Searching players...',
  foundPlayers: 'players found',
  foundPlayer: 'player found',
  noPlayersFound: 'No players found for',
  playButton: 'Play',
  findNearbyPlayersTitle: 'Find Nearby Players',
  findPlayersNearLocation: 'Find players near your location',
  thisWillRequestLocation: 'This will request access to your location to find nearby players',
  searchNearbyPlayersButton: 'Search Nearby Players',
  gettingLocationAndSearching: 'Getting your location and searching for nearby players...',
  locationAccessDenied: 'Location access denied. Please enable location services and try again.',
  locationUnavailable: 'Location information unavailable. Please try again.',
  locationTimeout: 'Location request timed out. Please try again.',
  locationError: 'Failed to get your location. Please try again.',
  searchNearbyError: 'Failed to search for nearby players. Please try again.',
  nearbyPlayersFound: 'nearby players found',
  noNearbyPlayersFound: 'No nearby players found',
  kmAway: 'km away',
  tryAgain: 'Try Again',
  searchAgain: 'Search Again',
  startingGameWith: 'Starting game with',
  playerIDSection: 'Player ID',
  playerIDSectionLabel: 'Player ID',
  yourPlayerIDLabel: 'Your Player ID',
  nameLabel: 'Name',
  copyTooltip: 'Copy Player ID',
  shareTooltip: 'Share Player ID',
  searchTooltip: 'Search Players',
  locationTooltip: 'Find Nearby Players',
  editTooltip: 'Edit Name',
  saveTooltip: 'Save Name',
  shareTitle: 'Join me in Bezique!',
  shareText: "Let's play Bezique together! My Player ID is:",
  // Opponent display
  opponent: 'Opponent',
  ahead: 'ahead',
  behind: 'behind',
  tied: 'tied',
};

export default translation;
