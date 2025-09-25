export interface Translation {
  // Main UI
  brisk: string;
  // Modal titles
  scoreHistory: string;
  settings: string;
  appInformation: string;
  resetScore: string;
  // Settings
  soundEffects: string;
  language: string;
  // History
  totalScore: string;
  noScoresRecorded: string;
  // Reset confirmation
  resetConfirmation: string;
  resetWarning: string;
  // Info modal
  appName: string;
  version: string;
  description: string;
  features: string;
  featureList: {
    scoreTracking: string;
    undoLastScore: string;
    viewHistory: string;
    briskCalculation: string;
    soundEffects: string;
    resetGame: string;
  };
  // Buttons
  close: string;
  reset: string;
  cancel: string;
  // Brisk popup
  selectBrisk: string;
  briskDescription: string;
  // Tooltips
  undoLastScoreTooltip: string;
  showScoreHistoryTooltip: string;
  resetScoreTooltip: string;
  settingsTooltip: string;
  appInformationTooltip: string;
  // Info page
  developedBy: string;
  buildDate: string;
  // Settings sections
  audioSection: string;
  // Congratulations
  congratulations: string;
  youWin: string;
  congratulationsMessage: string;
  newGame: string;
  // Multiplayer
  playerID: string;
  playerName: string;
  // Labels for Settings modal
  playerIDSectionLabel?: string;
  yourPlayerIDLabel?: string;
  nameLabel?: string;
  copyPlayerID: string;
  sharePlayerID: string;
  searchPlayers: string;
  findNearbyPlayers: string;
  editName: string;
  saveName: string;
  enterPlayerName: string;
  searchPlayersTitle: string;
  enterPlayerID: string;
  enterPlayerIDOrName: string;
  searchingPlayers: string;
  foundPlayers: string;
  foundPlayer: string;
  noPlayersFound: string;
  playButton: string;
  findNearbyPlayersTitle: string;
  findPlayersNearLocation: string;
  thisWillRequestLocation: string;
  searchNearbyPlayersButton: string;
  gettingLocationAndSearching: string;
  locationAccessDenied: string;
  locationUnavailable: string;
  locationTimeout: string;
  locationError: string;
  searchNearbyError: string;
  nearbyPlayersFound: string;
  noNearbyPlayersFound: string;
  kmAway: string;
  tryAgain: string;
  searchAgain: string;
  startingGameWith: string;
  playerIDSection: string;
  copyTooltip: string;
  shareTooltip: string;
  searchTooltip: string;
  locationTooltip: string;
  editTooltip: string;
  saveTooltip: string;
  shareTitle: string;
  shareText: string;
  // Opponent display
  opponent: string;
  ahead: string;
  behind: string;
  tied: string;
}

export interface LanguageMeta {
  code: string;
  name: string;
}
