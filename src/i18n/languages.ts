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
    congratulationsMessage: '10.000 puanı geçtiniz! Muhteşem bir oyun çıkardınız!',
    newGame: 'Yeni Oyun'
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
    congratulationsMessage: 'You\'ve reached over 10,000 points! Fantastic game!',
    newGame: 'New Game'
  }
};

export const availableLanguages = [
  { code: 'tr', name: 'Türkçe' },
  { code: 'en', name: 'English' }
];
