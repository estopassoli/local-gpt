import { useCallback } from 'react';

/**
 * Hook para gerenciar localStorage de forma segura
 */
export function useLocalStorage() {
    const setItem = useCallback((key: string, value: string) => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem(key, value);
            }
        } catch (error) {
            console.error(`Erro ao salvar no localStorage (${key}):`, error);
        }
    }, []);

    const getItem = useCallback((key: string): string | null => {
        try {
            if (typeof window !== 'undefined') {
                return localStorage.getItem(key);
            }
        } catch (error) {
            console.error(`Erro ao recuperar do localStorage (${key}):`, error);
        }
        return null;
    }, []);

    const removeItem = useCallback((key: string) => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.removeItem(key);
            }
        } catch (error) {
            console.error(`Erro ao remover do localStorage (${key}):`, error);
        }
    }, []);

    const clear = useCallback(() => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.clear();
            }
        } catch (error) {
            console.error('Erro ao limpar localStorage:', error);
        }
    }, []);

    return {
        setItem,
        getItem,
        removeItem,
        clear
    };
}
