export interface WindowSize {
  width: number;
  height: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}