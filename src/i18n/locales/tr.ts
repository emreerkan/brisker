import type { LanguageMeta, Translation } from '../types';

export const meta: LanguageMeta = {
  code: 'tr',
  name: 'Türkçe',
};

const translation: Translation = {
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
  appName: 'Brisker',
  version: 'Sürüm',
  description: 'Bezik kart oyunu için skor takip uygulaması',
  features: 'Özellikler',
  featureList: {
    scoreTracking: 'Skor takibi ve toplama',
    undoLastScore: 'Son skoru geri alma',
    viewHistory: 'Skor geçmişini görüntüleme',
    briskCalculation: 'Brisk hesaplaması (brisk × 20)',
    soundEffects: 'Ses efektleri',
    resetGame: 'Oyunu sıfırlama',
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
  tied: 'berabere',
};

export default translation;
