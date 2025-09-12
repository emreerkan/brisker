import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Users } from 'lucide-react';
import type { ModalProps, Player } from '@/types';
import { GameServerAPI } from '@/services/gameServer';
import { useLanguage } from '@/i18n/LanguageContext';
import styles from '../BeziqueScoreKeeper.module.css';

interface PlayerSearchModalProps extends ModalProps {
  onPlayWith: (player: Player) => void;
}

export const PlayerSearchModal: React.FC<PlayerSearchModalProps> = ({
  isOpen,
  onClose,
  onPlayWith
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Wait for the input to be mounted, then focus & select for quick typing
      const id = window.setTimeout(() => {
        if (inputRef.current) {
          try {
            inputRef.current.focus();
            inputRef.current.select();
          } catch (e) {
            // ignore if focus/select isn't supported in environment
          }
        }
      }, 0);
      return () => window.clearTimeout(id);
    }
    return;
  }, [isOpen]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const results = await GameServerAPI.searchPlayersByID(searchTerm.trim());
      setSearchResults(results);
      setHasSearched(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePlayWith = (player: Player) => {
    onPlayWith(player);
    // Don't call onClose() here - the parent component will handle closing modals
  };

  const handleClose = () => {
    setSearchTerm('');
    setSearchResults([]);
    setHasSearched(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{t.searchPlayersTitle}</h3>
          <button className={styles.modalClose} onClick={handleClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className={styles.playerSearchContent}>
          <div className={styles.searchInputContainer}>
            <input
              type="text"
              placeholder={t.enterPlayerIDOrName}
              value={searchTerm}
              ref={inputRef}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className={styles.searchInput}
              disabled={isSearching}
            />
            <button
              className={styles.searchButton}
              onClick={handleSearch}
              disabled={isSearching || !searchTerm.trim()}
            >
              <Search size={20} />
            </button>
          </div>
          
          {isSearching && (
            <div className={styles.searchingIndicator}>
              {t.searchingPlayers}
            </div>
          )}
          
          {hasSearched && !isSearching && (
            <div className={styles.searchResults}>
              {searchResults.length > 0 ? (
                <>
                  <h4 className={styles.searchResultsTitle}>
                    <Users size={18} />
                    {t.foundPlayers} ({searchResults.length}):
                  </h4>
                  <div className={styles.playerList}>
                    {searchResults.map((player) => (
                      <div key={player.playerID} className={styles.playerItem}>
                        <div className={styles.playerInfo}>
                          <div className={styles.playerName}>{player.name}</div>
                          <div className={styles.playerID}>ID: {player.playerID}</div>
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
                  {t.noPlayersFound}
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
