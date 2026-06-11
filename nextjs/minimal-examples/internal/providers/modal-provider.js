import {createContext, useContext, useState} from "react";

const ModalContext = createContext(null);

export function ModalProvider({children}) {
    const [modalState, setModalState] = useState({
        login: {isOpen: false, props: {}},
        premium: {isOpen: false, props: {}},
    });

    const openModal = (modalName, props = {}) => {
        setModalState((prevState) => ({
            ...prevState,
            [modalName]: {isOpen: true, props},
        }));
    };

    const closeModal = (modalName) => {
        setModalState((prevState) => ({
            ...prevState,
            [modalName]: {isOpen: false, props: {}},
        }));
    };

    return (
        <ModalContext.Provider value={{modalState, openModal, closeModal}}>
            {children}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
}
