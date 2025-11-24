import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  message: ToastMessage;
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ message, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = message.duration ?? 4000;
    const exitDelay = duration - 300; // Start exit animation 300ms before dismiss

    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, exitDelay);

    const dismissTimer = setTimeout(() => {
      onDismiss(message.id);
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(dismissTimer);
    };
  }, [message, onDismiss]);

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <XCircle size={20} />;
      case 'info':
        return <Info size={20} />;
    }
  };

  return (
    <div 
      className={`${styles.toast} ${styles[message.type]} ${isExiting ? styles.exiting : ''}`}
      onClick={() => onDismiss(message.id)}
    >
      <div className={styles.toastIcon}>
        {getIcon()}
      </div>
      <div className={styles.toastMessage}>
        {message.message}
      </div>
    </div>
  );
};

export default Toast;
