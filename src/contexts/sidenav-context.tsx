'use client';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

type SidenavContextValue = {
    open: boolean;
    openSidenav: () => void;
    closeSidenav: () => void;
    toggleSidenav: () => void;
    setOpen: (value: boolean) => void;
};

const SidenavContext = createContext<SidenavContextValue | undefined>(undefined);

const SIDENAV_STORAGE_KEY = 'sidenav-open';

export function SidenavProvider({
    children,
    defaultOpen = false,
}: {
    children: ReactNode;
    defaultOpen?: boolean;
}) {

    const [open, setOpenState] = useState<boolean>(defaultOpen);

    // Função para atualizar o estado e salvar no localStorage
    const setOpen = useCallback((value: boolean) => {
        setOpenState(value);

        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(SIDENAV_STORAGE_KEY, JSON.stringify(value));
            } catch (error) {
                console.warn('Erro ao salvar estado do sidenav no localStorage:', error);
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const storedValue = localStorage.getItem(SIDENAV_STORAGE_KEY);
                if (storedValue !== null) {
                    setOpenState(storedValue === 'true');
                }
            } catch (error) {
                console.warn('Erro ao ler estado do sidenav do localStorage:', error);
            }
        }
    }, [])

    const openSidenav = useCallback(() => setOpen(true), [setOpen]);
    const closeSidenav = useCallback(() => setOpen(false), [setOpen]);
    const toggleSidenav = useCallback(() => {
        setOpenState((prev) => {
            const newValue = !prev;
            if (typeof window !== 'undefined') {
                try {
                    localStorage.setItem(SIDENAV_STORAGE_KEY, JSON.stringify(newValue));
                } catch (error) {
                    console.warn('Erro ao salvar estado do sidenav no localStorage:', error);
                }
            }
            return newValue;
        });
    }, []);

    return <SidenavContext.Provider value={{ open, openSidenav, closeSidenav, toggleSidenav, setOpen }}>{children}</SidenavContext.Provider>;
}

export function useSidenav() {
    const ctx = useContext(SidenavContext);
    if (!ctx) {
        throw new Error("useSidenav must be used within a SidenavProvider");
    }
    return ctx;
}