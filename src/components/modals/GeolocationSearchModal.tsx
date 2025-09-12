import React, { useState } from 'react';
import { MapPin, X, Users, AlertCircle } from 'lucide-react';
import type { ModalProps, Player } from '@/types';
import { GameServerAPI } from '@/services/gameServer';
import { getGeolocation } from '@/utils/deviceUtils';
import { useLanguage } from '@/i18n/LanguageContext';
import styles from '@/components/Brisker.module.css';

interface GeolocationSearchModalProps extends ModalProps {
  onPlayWith: (player: Player) => void;
}

export const GeolocationSearchModal: React.FC<GeolocationSearchModalProps> = ({
  isOpen,
  onClose,
  onPlayWith
}) => {
  const { t } = useLanguage();
  const [nearbyPlayers, setNearbyPlayers] = useState<Player[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationSearch = async () => {
    setIsSearching(true);
    setError(null);

    try {
      // Get user's location
      const position = await getGeolocation();
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      // Update current player's location on server
      try {
        GameServerAPI.updatePlayerLocation(location);
      } catch (locationError) {
        console.warn('Failed to update player location on server:', locationError);
        // Continue with search even if location update fails
      }

      // Search for nearby players
      const results = await GameServerAPI.searchPlayersByLocation(location);
      setNearbyPlayers(results);
      setHasSearched(true);
    } catch (error) {
      console.error('Geolocation search failed:', error);
      
      // Check if it's our enhanced error with iOS-specific instructions
      if (error instanceof Error && error.message.includes('iOS PWA apps')) {
        // Use the detailed iOS instructions from our enhanced geolocation error
        setError(error.message);
      } else if (error instanceof GeolocationPositionError) {
        // Handle standard geolocation errors
        switch (error.code) {
          case GeolocationPositionError.PERMISSION_DENIED:
            setError(t.locationAccessDenied);
            break;
          case GeolocationPositionError.POSITION_UNAVAILABLE:
            setError(t.locationUnavailable);
            break;
          case GeolocationPositionError.TIMEOUT:
            setError(t.locationTimeout);
            break;
          default:
            setError(t.locationError);
        }
      } else if (error instanceof Error) {
        // Handle our enhanced error messages
        setError(error.message);
      } else {
        setError(t.searchNearbyError);
      }
      setNearbyPlayers([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlayWith = (player: Player) => {
    onPlayWith(player);
    // Don't call onClose() here - the parent component will handle closing modals
  };

  const handleClose = () => {
    setNearbyPlayers([]);
    setHasSearched(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{t.findNearbyPlayersTitle}</h3>
          <button className={styles.modalClose} onClick={handleClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className={styles.geolocationSearchContent}>
          {!hasSearched && !isSearching && (
            <div className={styles.geolocationPrompt}>
              <MapPin size={48} className={styles.geolocationIcon} />
              <p>{t.findPlayersNearLocation}</p>
              <p className={styles.geolocationNote}>
                {t.thisWillRequestLocation}
              </p>
              <button
                className={styles.locationSearchButton}
                onClick={handleLocationSearch}
              >
                <MapPin size={20} />
                {t.searchNearbyPlayersButton}
              </button>
            </div>
          )}
          
          {isSearching && (
            <div className={styles.searchingIndicator}>
              <MapPin size={24} className={styles.searchingIcon} />
			  <br />
              {t.gettingLocationAndSearching}
            </div>
          )}
          
          {error && (
            <div className={styles.errorMessage}>
              <AlertCircle size={20} />
              <div>
                <div style={{ marginBottom: '10px' }}>
                  {error}
                </div>
                <button
                  className={styles.retryButton}
                  onClick={handleLocationSearch}
                >
                  {t.tryAgain}
                </button>
              </div>
            </div>
          )}
          
          {hasSearched && !isSearching && !error && (
            <div className={styles.searchResults}>
              {nearbyPlayers.length > 0 ? (
                <>
                  <h4 className={styles.searchResultsTitle}>
                    <Users size={18} />
                    {t.nearbyPlayersFound} ({nearbyPlayers.length}):
                  </h4>
                  <div className={styles.playerList}>
                    {nearbyPlayers.map((player) => (
                      <div key={player.playerID} className={styles.playerItem}>
                        <div className={styles.playerInfo}>
                          <div className={styles.playerName}>{player.name}</div>
                          <div className={styles.playerID}>ID: {player.playerID}</div>
                          {player.distance !== undefined && (
                            <div className={styles.playerDistance}>
                              📍 {player.distance.toFixed(1)} {t.kmAway}
                            </div>
                          )}
                        </div>
                        <button
                          className={styles.playButton}
                          onClick={() => handlePlayWith(player)}
                        >
                          {t.playButton}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className={styles.noResults}>
                  <MapPin size={24} />
                  {t.noNearbyPlayersFound}
                  <button
                    className={styles.retryButton}
                    onClick={handleLocationSearch}
                  >
                    {t.searchAgain}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className={styles.modalFooter}>
          <button 
            className={`${styles.modalButton} ${styles.modalButtonCancel}`} 
            onClick={handleClose}
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
