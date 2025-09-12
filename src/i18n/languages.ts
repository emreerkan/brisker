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

export const translations: Record<string, Translation> = {
  tr: {
    // Main UI
    brisk: 'Brisk',
    // Modal titles
    scoreHistory: 'Skor Geçmişi',
    settings: 'Ayarlar',
    appInformation: 'Uygulama Bilgileri',
    resetScore: 'Skoru Sıfırla',
    // Settings
    soundEffects: 'Ses Efektleri',
    language: 'Dil',
    // History
    totalScore: 'Toplam Skor',
    noScoresRecorded: 'Henüz skor kaydedilmedi',
    // Reset confirmation
    resetConfirmation: 'Skoru Sıfırla',
    resetWarning: 'Bu işlem tüm skorları siler ve geri alınamaz.',
    // Info modal
    appName: 'Bezik Skor Takipçisi',
    version: 'Sürüm',
    description: 'Bezik kart oyunu için skor takip uygulaması',
    features: 'Özellikler',
    featureList: {
      scoreTracking: 'Skor takibi ve toplama',
      undoLastScore: 'Son skoru geri alma',
      viewHistory: 'Skor geçmişini görüntüleme',
      briskCalculation: 'Brisk hesaplaması (brisk × 20)',
      soundEffects: 'Ses efektleri',
      resetGame: 'Oyunu sıfırlama'
    },
    // Buttons
    close: 'Kapat',
    reset: 'Sıfırla',
    cancel: 'İptal',
    // Brisk popup
    selectBrisk: 'Brisk Seçin',
    briskDescription: 'Brisk sayısını seçin (brisk × 20 puan ekler)',
    // Tooltips
    undoLastScoreTooltip: 'Son skoru geri al',
    showScoreHistoryTooltip: 'Skor geçmişini göster',
    resetScoreTooltip: 'Skoru sıfırla',
    settingsTooltip: 'Ayarlar',
    appInformationTooltip: 'Uygulama bilgileri',
    // Info page
    developedBy: 'Emre Erkan yönetiminde Claude Sonnet 4 ve GitHub Copilot ile oluşturuldu',
    buildDate: 'Oluşturma tarihi: Eylül 2025',
    // Settings sections
    audioSection: 'Ses',
    // Congratulations
    congratulations: 'Tebrikler!',
    youWin: 'Kazandın!',
    congratulationsMessage: '10.000 puana ulaştınız! Muhteşem bir oyun çıkardınız!',
    newGame: 'Yeni Oyun',
    // Multiplayer
    playerID: 'Oyuncu ID',
    playerName: 'Oyuncu Adı',
    copyPlayerID: 'Oyuncu ID\'sini Kopyala',
    sharePlayerID: 'Oyuncu ID\'sini Paylaş',
    searchPlayers: 'Oyuncu Ara',
    findNearbyPlayers: 'Yakındaki Oyuncular',
    editName: 'Adı Düzenle',
    saveName: 'Adı Kaydet',
    enterPlayerName: 'Oyuncu adınızı girin',
    searchPlayersTitle: 'Oyuncu Ara',
    enterPlayerID: 'Oyuncu ID girin',
    enterPlayerIDOrName: 'Oyuncu ID veya Ad girin...',
    searchingPlayers: 'Oyuncular aranıyor...',
    foundPlayers: 'oyuncu bulundu',
    foundPlayer: 'oyuncu bulundu',
    noPlayersFound: 'için oyuncu bulunamadı',
    playButton: 'Oyna',
    findNearbyPlayersTitle: 'Yakındaki Oyuncuları Bul',
    findPlayersNearLocation: 'Konumunuza yakın oyuncuları bulun',
    thisWillRequestLocation: 'Bu işlem yakındaki oyuncuları bulmak için konum erişimi isteyecek',
    searchNearbyPlayersButton: 'Yakındaki Oyuncuları Ara',
    gettingLocationAndSearching: 'Konumunuz alınıyor ve yakındaki oyuncular aranıyor...',
    locationAccessDenied: 'Konum erişimi reddedildi. Lütfen konum servislerini etkinleştirin ve tekrar deneyin.',
    locationUnavailable: 'Konum bilgisi kullanılamıyor. Lütfen tekrar deneyin.',
    locationTimeout: 'Konum isteği zaman aşımına uğradı. Lütfen tekrar deneyin.',
    locationError: 'Konumunuz alınamadı. Lütfen tekrar deneyin.',
    searchNearbyError: 'Yakındaki oyuncular aranırken hata oluştu. Lütfen tekrar deneyin.',
    nearbyPlayersFound: 'yakındaki oyuncu bulundu',
    noNearbyPlayersFound: 'Yakında oyuncu bulunamadı',
    kmAway: 'km uzaklıkta',
    tryAgain: 'Tekrar Dene',
    searchAgain: 'Tekrar Ara',
    startingGameWith: 'ile oyuna başlıyor',
  playerIDSection: 'Oyuncu ID',
  playerIDSectionLabel: 'Oyuncu ID',
  yourPlayerIDLabel: 'Oyuncu IDniz',
  nameLabel: 'İsim',
    copyTooltip: 'Oyuncu ID\'sini Kopyala',
    shareTooltip: 'Oyuncu ID\'sini Paylaş',
    searchTooltip: 'Oyuncu Ara',
    locationTooltip: 'Yakındaki Oyuncuları Bul',
    editTooltip: 'Adı Düzenle',
    saveTooltip: 'Adı Kaydet',
    shareTitle: 'Benimle Bezik oyna!',
    shareText: 'Hadi beraber Bezik oynayalım! Benim Oyuncu ID\'m:',
    // Opponent display
    opponent: 'Rakip',
    ahead: 'önde',
    behind: 'geride',
    tied: 'berabere'
  },
  en: {
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
    appName: 'Bezique Score Keeper',
    version: 'Version',
    description: 'Score keeping application for the Bezique card game',
    features: 'Features',
    featureList: {
      scoreTracking: 'Score tracking and addition',
      undoLastScore: 'Undo last score',
      viewHistory: 'View score history',
      briskCalculation: 'Brisk calculation (brisk × 20)',
      soundEffects: 'Sound effects',
      resetGame: 'Reset game'
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
    congratulationsMessage: 'You\'ve reached to 10,000 points! Fantastic game!',
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
    shareText: 'Let\'s play Bezique together! My Player ID is:',
    // Opponent display
    opponent: 'Opponent',
    ahead: 'ahead',
    behind: 'behind',
    tied: 'tied'
  }
};

export const availableLanguages = [
  { code: 'tr', name: 'Türkçe' },
  { code: 'en', name: 'English' }
];
