import { useState, useCallback } from "react";

export const useModalManager = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    confirmationConfig: null,
  });

  const openModal = useCallback((type) => {
    setModalState({
      isOpen: true,
      type,
      confirmationConfig: null,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({
      isOpen: false,
      type: null,
      confirmationConfig: null,
    });
  }, []);

  const openConfirmation = useCallback((config) => {
    setModalState({
      isOpen: true,
      type: "confirmation",
      confirmationConfig: config,
    });
  }, []);

  return {
    modalState,
    openModal,
    closeModal,
    openConfirmation,
  };
};
