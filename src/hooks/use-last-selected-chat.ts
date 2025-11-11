import { useLocalStorage } from './use-local-storage';

const LAST_SELECTED_CHAT_KEY = 'lastSelectedChatId';
const CHAT_CLOSED_BY_USER_KEY = 'chatClosedByUser';

/**
 * Hook para gerenciar o último chat selecionado
 */
export function useLastSelectedChat() {
    const { setItem, getItem, removeItem } = useLocalStorage();

    const saveLastSelectedChatId = (chatId: string) => {
        setItem(LAST_SELECTED_CHAT_KEY, chatId);
        console.log('💾 Chat ID salvo no localStorage:', chatId);
    };

    const getLastSelectedChatId = (): string | null => {
        return getItem(LAST_SELECTED_CHAT_KEY);
    };

    const clearLastSelectedChatId = () => {
        removeItem(LAST_SELECTED_CHAT_KEY);
        console.log('🗑️ Chat ID removido do localStorage');
    };

    const setChatClosedByUser = (closed: boolean) => {
        if (closed) {
            setItem(CHAT_CLOSED_BY_USER_KEY, 'true');
            console.log('🚪 Estado de chat fechado salvo no localStorage');
        } else {
            removeItem(CHAT_CLOSED_BY_USER_KEY);
        }
    };

    const getChatClosedByUser = (): boolean => {
        return getItem(CHAT_CLOSED_BY_USER_KEY) === 'true';
    };

    return {
        saveLastSelectedChatId,
        getLastSelectedChatId,
        clearLastSelectedChatId,
        setChatClosedByUser,
        getChatClosedByUser
    };
}
