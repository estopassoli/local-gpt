'use client'

import { CommandPalette } from '@/components/command-palette'
import { useLastSelectedChat } from '@/hooks/use-last-selected-chat'
import { Chat as PrismaChat } from '@prisma/client'
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

// Tipos baseados no schema Prisma
export type Role = 'USER' | 'ASSISTANT' | 'SYSTEM'

export interface Message {
    id: string
    chatId: string
    role: Role
    content: string
    createdAt: Date
    isStreaming?: boolean // Para mensagens em streaming
}

interface Chat extends PrismaChat {
    messages: Message[]
}
// Tipos para o contexto
interface ChatContextType {
    // Estado
    chats: Chat[]
    currentChat: Chat | null
    isLoading: boolean
    error: string | null
    isGenerating: boolean
    streamingMessage: string | null // Conteúdo da mensagem sendo streamada

    // Ações de Chat
    createChat: () => Promise<Chat>
    loadChats: () => Promise<void>
    loadArchivedChats: () => Promise<Chat[]>
    selectChat: (chatId: string) => Promise<void>
    closeChat: () => void
    deleteChat: (chatId: string) => Promise<void>
    updateChatTitle: (chatId: string, title: string) => Promise<void>
    archiveChat: (chatId: string) => Promise<void>
    unarchiveChat: (chatId: string) => Promise<void>

    // Ações de Mensagem
    sendMessage: (content: string, chatId?: string) => Promise<void>
    addMessage: (message: Omit<Message, 'id' | 'createdAt'>) => Promise<Message>
    clearMessages: () => void

    // Configurações
    availableModels: string[]
    changeLLMModel: (model: string) => Promise<void>
    selectedModel: string,
    setSelectedModel: React.Dispatch<React.SetStateAction<string>>,

    // Utilities
    clearError: () => void
    regenerateLastResponse: () => Promise<void>

    // Command Palette
    isCommandPaletteOpen: boolean
    setCommandPaletteOpen: (open: boolean) => void
}

const ChatContext = createContext<ChatContextType | null>(null)

// Hook personalizado para usar o contexto
export const useChat = () => {
    const context = useContext(ChatContext)
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider')
    }
    return context
}

interface ChatProviderProps {
    children: ReactNode
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
    const [chats, setChats] = useState<Chat[]>([])
    const [currentChat, setCurrentChat] = useState<Chat | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [streamingMessage, setStreamingMessage] = useState<string | null>(null)
    const [selectedModel, setSelectedModel] = useState<string>('llama3:latest')
    const [availableModels, setAvailableModels] = useState<string[]>([])
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
    
    // Inicializar como false, será atualizado no useEffect
    const [chatClosedByUser, setChatClosedByUser] = useState(false)

    useEffect(() => {
        // Buscar modelos disponíveis através da nossa API
        const fetchAvailableModels = async () => {
            try {
                const response = await fetch('/api/models')
                const data = await response.json()

                if (data.models) {
                    // Extrair apenas os nomes dos modelos
                    const modelNames = data.models.map((model: { name: string }) => model.name)
                    setAvailableModels(modelNames)
                } else {
                    // Fallback para modelos padrão se não conseguir conectar com Ollama
                    setAvailableModels(['llama2', 'codellama', 'mistral'])
                }
            } catch (error) {
                console.error('Erro ao buscar modelos disponíveis:', error)
                // Fallback para modelos padrão
                setAvailableModels(['llama2', 'codellama', 'mistral'])
            }
        }

        fetchAvailableModels()
    }, [])

    // Hook para gerenciar o último chat selecionado
    const { 
        saveLastSelectedChatId, 
        getLastSelectedChatId, 
        clearLastSelectedChatId,
        setChatClosedByUser: saveChatClosedByUser,
        getChatClosedByUser
    } = useLastSelectedChat()

    // Funções de API para comunicar com o backend
    const apiCall = async (endpoint: string, options: RequestInit = {}) => {
        try {
            const response = await fetch(`/api${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            console.error('API call failed:', error)
            throw error
        }
    }



    // Ações de Chat
    const createChat = useCallback(async (): Promise<Chat> => {
        try {
            setIsLoading(true)
            setError(null)

            const newChat = await apiCall('/chats', {
                method: 'POST',
                body: JSON.stringify({
                    title: null,
                })
            })

            setChats(prev => [newChat, ...prev])
            setCurrentChat(newChat)
            setChatClosedByUser(false) // Resetar quando criar um novo chat
            saveChatClosedByUser(false) // Limpar do localStorage
            return newChat
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao criar chat'
            setError(errorMessage)
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [saveChatClosedByUser])

    const loadChats = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            const chatsData = await apiCall('/chats')
            // Filtrar apenas chats não arquivados
            const activeChats = chatsData.filter((chat: Chat) => !chat.isArchived)
            setChats(activeChats)

            // Auto-selecionar o último chat se existir e não há chat atual selecionado
            // Mas apenas se o usuário não fechou explicitamente um chat
            if (!currentChat && activeChats.length > 0 && !chatClosedByUser) {
                const lastSelectedChatId = getLastSelectedChatId()

                if (lastSelectedChatId) {
                    // Verificar se o último chat selecionado ainda existe
                    const lastChat = activeChats.find((chat: Chat) => chat.id === lastSelectedChatId)
                    if (lastChat) {
                        console.log('🔄 Auto-selecionando último chat:', lastSelectedChatId)
                        // Não chamar selectChat aqui para evitar loop, apenas buscar os dados
                        const chatData = await apiCall(`/chats/${lastSelectedChatId}`)
                        setCurrentChat(chatData)
                        return
                    } else {
                        // Chat não existe mais, limpar do localStorage
                        clearLastSelectedChatId()
                    }
                }

                // Se não há último chat válido, selecionar o primeiro da lista
                console.log('🎯 Selecionando primeiro chat da lista')
                const chatData = await apiCall(`/chats/${activeChats[0].id}`)
                setCurrentChat(chatData)
                saveLastSelectedChatId(activeChats[0].id)
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar chats'
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }, [currentChat, chatClosedByUser, getLastSelectedChatId, clearLastSelectedChatId, saveLastSelectedChatId])

    const selectChat = useCallback(async (chatId: string) => {
        try {
            setIsLoading(true)
            setError(null)

            const chatData = await apiCall(`/chats/${chatId}`)
            setCurrentChat(chatData)
            setChatClosedByUser(false) // Resetar o estado quando o usuário seleciona um chat
            saveChatClosedByUser(false) // Limpar do localStorage
            
            // Salvar o ID do chat selecionado no localStorage
            saveLastSelectedChatId(chatId)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao selecionar chat'
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }, [saveLastSelectedChatId, saveChatClosedByUser])

    const closeChat = useCallback(() => {
        console.log('🚪 Fechando chat atual')
        setCurrentChat(null)
        setChatClosedByUser(true) // Marcar que o usuário fechou explicitamente
        saveChatClosedByUser(true) // Persistir no localStorage
        clearLastSelectedChatId()
        
        // Limpar mensagem de streaming se houver
        if (streamingMessage) {
            setStreamingMessage(null)
        }
        
        // Parar geração se estiver em andamento
        if (isGenerating) {
            setIsGenerating(false)
        }
    }, [streamingMessage, isGenerating, clearLastSelectedChatId, saveChatClosedByUser])

    const deleteChat = useCallback(async (chatId: string) => {
        try {
            setIsLoading(true)
            setError(null)

            await apiCall(`/chats/${chatId}`, { method: 'DELETE' })

            setChats(prev => prev.filter(chat => chat.id !== chatId))

            if (currentChat?.id === chatId) {
                setCurrentChat(null)
                // Limpar do localStorage se o chat deletado era o selecionado
                const lastSelectedChatId = getLastSelectedChatId()
                if (lastSelectedChatId === chatId) {
                    clearLastSelectedChatId()
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar chat'
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }, [currentChat, getLastSelectedChatId, clearLastSelectedChatId])

    const updateChatTitle = useCallback(async (chatId: string, title: string) => {
        try {
            setError(null)

            const updatedChat = await apiCall(`/chats/${chatId}`, {
                method: 'PATCH',
                body: JSON.stringify({ title }),
            })

            setChats(prev => prev.map(chat =>
                chat.id === chatId ? updatedChat : chat
            ))

            if (currentChat?.id === chatId) {
                setCurrentChat(updatedChat)
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar título'
            setError(errorMessage)
        }
    }, [currentChat])

    // Ações de Mensagem
    const addMessage = useCallback(async (messageData: Omit<Message, 'id' | 'createdAt'>): Promise<Message> => {
        try {
            setError(null)

            const newMessage = await apiCall('/messages', {
                method: 'POST',
                body: JSON.stringify(messageData),
            })

            // Atualizar o chat atual com a nova mensagem
            if (currentChat && currentChat.id === messageData.chatId) {
                setCurrentChat(prev => prev ? {
                    ...prev,
                    messages: [...prev.messages, newMessage]
                } : null)
            }

            return newMessage
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao adicionar mensagem'
            setError(errorMessage)
            throw error
        }
    }, [currentChat])

    const sendMessage = useCallback(async (content: string, chatId?: string) => {
        console.log("🚀 SendMessage iniciado", { content, chatId, currentChatId: currentChat?.id });

        // Se foi fornecido um chatId específico, buscar o chat
        let targetChat = currentChat;

        if (chatId && chatId !== currentChat?.id) {
            console.log("🔍 Buscando chat específico:", chatId);
            // Buscar o chat específico na lista ou via API
            const foundChat = chats.find(c => c.id === chatId);
            if (foundChat) {
                console.log("✅ Chat encontrado na lista:", foundChat);
                targetChat = foundChat;
            } else {
                // Se não encontrou na lista, buscar via API
                console.log("🌐 Buscando chat via API...");
                try {
                    const chatData = await apiCall(`/chats/${chatId}`);
                    console.log("✅ Chat obtido via API:", chatData);
                    targetChat = chatData;
                    // Definir como chat atual se não há chat atual
                    if (!currentChat) {
                        console.log("🎯 Definindo como chat atual");
                        setCurrentChat(chatData);
                    }
                } catch (error) {
                    console.error('❌ Erro ao buscar chat:', error);
                }
            }
        }

        if (!targetChat) {
            console.error("❌ Nenhum chat disponível para envio");
            throw new Error('Nenhum chat selecionado')
        }

        console.log("📋 Chat target definido:", targetChat.id);

        try {
            setIsGenerating(true)
            setError(null)
            setStreamingMessage('')

            console.log(`💬 Enviando mensagem para chat ${targetChat.id}:`, content)

            // Adicionar mensagem do usuário
            console.log("👤 Adicionando mensagem do usuário...");
            const userMessage = await addMessage({
                chatId: targetChat.id,
                role: 'USER',
                content,
            })
            console.log("✅ Mensagem do usuário adicionada:", userMessage);

            // Se este é o chat atual ou se não há chat atual, atualizar o estado
            if (!currentChat || currentChat.id === targetChat.id) {
                console.log("🔄 Atualizando currentChat com mensagem do usuário");
                setCurrentChat(prev => {
                    const baseMessages = prev?.id === targetChat.id ? prev.messages : [];
                    return {
                        ...targetChat,
                        messages: [...baseMessages, userMessage]
                    };
                });
            }

            // Chamar API de streaming para gerar resposta da IA
            console.log("🤖 Iniciando streaming da resposta...");
            const response = await fetch('/api/chat/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chatId: targetChat.id,
                    model: targetChat.llmModel || selectedModel,
                    messages: [...targetChat.messages, userMessage],
                }),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('Não foi possível ler a resposta do streaming');
            }

            const decoder = new TextDecoder();
            let accumulatedContent = '';

            try {
                while (true) {
                    const { done, value } = await reader.read();

                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    accumulatedContent += chunk;

                    // Atualizar a mensagem de streaming
                    setStreamingMessage(accumulatedContent);
                }
            } finally {
                reader.releaseLock();
            }

            console.log("✅ Streaming concluído, conteúdo final:", accumulatedContent);

            // Limpar a mensagem de streaming
            setStreamingMessage(null);

            // A mensagem já foi salva no banco pela API de streaming
            // Recarregar as mensagens do chat para obter a mensagem completa
            try {
                const updatedChat = await apiCall(`/chats/${targetChat.id}`);
                if (!currentChat || currentChat.id === targetChat.id) {
                    setCurrentChat(updatedChat);
                }
            } catch (error) {
                console.error('Erro ao recarregar chat:', error);
                // Fallback: adicionar mensagem manualmente
                const aiMessage: Message = {
                    id: `temp-${Date.now()}`,
                    chatId: targetChat.id,
                    role: 'ASSISTANT',
                    content: accumulatedContent,
                    createdAt: new Date()
                };

                if (!currentChat || currentChat.id === targetChat.id) {
                    setCurrentChat(prev => {
                        const baseMessages = prev?.messages || [];
                        return {
                            ...targetChat,
                            messages: [...baseMessages, aiMessage]
                        };
                    });
                }
            }

            console.log("🎉 SendMessage concluído com sucesso!");

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar mensagem'
            console.error("❌ Erro em sendMessage:", error);
            setError(errorMessage)
            throw error
        } finally {
            setIsGenerating(false)
            setStreamingMessage(null)
        }
    }, [currentChat, addMessage, chats, selectedModel])

    const clearMessages = useCallback(() => {
        if (currentChat) {
            setCurrentChat({
                ...currentChat,
                messages: []
            })
        }
    }, [currentChat])

    const changeLLMModel = useCallback(async (model: string) => {
        if (!currentChat) {
            throw new Error('Nenhum chat selecionado')
        }

        try {
            setError(null)

            const updatedChat = await apiCall(`/chats/${currentChat.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ llmModel: model }),
            })

            setCurrentChat(updatedChat)

            setChats(prev => prev.map(chat =>
                chat.id === currentChat.id ? updatedChat : chat
            ))
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar modelo'
            setError(errorMessage)
        }
    }, [currentChat])

    useEffect(() => {
        //Se estiver com currentChat definido, faz o update do modelo lá também
        if (currentChat) {
            changeLLMModel(selectedModel).catch((error) => {
                console.error('Erro ao alterar modelo do chat atual:', error)
            })
        }
    }, [selectedModel])

    const regenerateLastResponse = useCallback(async () => {
        if (!currentChat || currentChat.messages.length < 2) {
            throw new Error('Não há resposta para regenerar')
        }

        try {
            setIsGenerating(true)
            setError(null)

            const messages = currentChat.messages
            const lastAssistantMessageIndex = messages.map((msg, index) => ({ msg, index }))
                .reverse()
                .find(({ msg }) => msg.role === 'ASSISTANT')?.index

            if (lastAssistantMessageIndex === undefined) {
                throw new Error('Nenhuma resposta do assistente encontrada')
            }

            // Remover a última resposta da IA
            const messagesUntilLastUser = messages.slice(0, lastAssistantMessageIndex)

            // Atualizar o estado local temporariamente
            setCurrentChat(prev => prev ? {
                ...prev,
                messages: messagesUntilLastUser
            } : null)

            // Gerar nova resposta
            const response = await apiCall('/chat/completion', {
                method: 'POST',
                body: JSON.stringify({
                    chatId: currentChat.id,
                    model: currentChat.llmModel,
                    messages: messagesUntilLastUser,
                    regenerate: true,
                    originalMessageId: messages[lastAssistantMessageIndex].id
                }),
            })

            // Adicionar nova resposta
            await addMessage({
                chatId: currentChat.id,
                role: 'ASSISTANT',
                content: response.content,
            })

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao regenerar resposta'
            setError(errorMessage)
            throw error
        } finally {
            setIsGenerating(false)
        }
    }, [currentChat, addMessage])

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    // Listener para atalhos de teclado
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // CTRL + SHIFT + O para criar novo chat
            if (event.ctrlKey && event.shiftKey && event.key === 'O') {
                event.preventDefault()
                createChat().catch((error) => {
                    console.error('Erro ao criar novo chat via atalho:', error)
                })
            }

            // CTRL + K para abrir command palette
            if (event.ctrlKey && event.key === 'k') {
                event.preventDefault()
                setIsCommandPaletteOpen(true)
            }
        }

        // Adicionar listener ao document
        document.addEventListener('keydown', handleKeyDown)

        // Cleanup - remover listener quando componente for desmontado
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [createChat]) // Dependências para garantir que sempre tenha os valores atualizados

    const archiveChat = useCallback(async (chatId: string) => {
        try {
            setIsLoading(true)
            setError(null)

            // Atualizar o chat para arquivado
            await apiCall(`/chats/${chatId}`, {
                method: 'PATCH',
                body: JSON.stringify({ isArchived: true }),
            })

            // Remover o chat da lista de chats ativos
            setChats(prev => prev.filter(chat => chat.id !== chatId))

            // Se o chat arquivado é o atual, limpar seleção
            if (currentChat?.id === chatId) {
                setCurrentChat(null)
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao arquivar chat'
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }, [currentChat])

    const loadArchivedChats = useCallback(async (): Promise<Chat[]> => {
        try {
            setError(null)

            const chatsData = await apiCall('/chats?includeArchived=true')
            // Filtrar apenas chats arquivados
            const archivedChats = chatsData.filter((chat: Chat) => chat.isArchived)
            return archivedChats
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar chats arquivados'
            setError(errorMessage)
            return []
        }
    }, [])

    const unarchiveChat = useCallback(async (chatId: string) => {
        try {
            setIsLoading(true)
            setError(null)

            // Atualizar o chat para não arquivado
            const unarchivedChat = await apiCall(`/chats/${chatId}`, {
                method: 'PATCH',
                body: JSON.stringify({ isArchived: false }),
            })

            // Adicionar o chat de volta à lista de chats ativos
            setChats(prev => [unarchivedChat, ...prev])

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao desarquivar chat'
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Carregar chats automaticamente na inicialização
    useEffect(() => {
        loadChats()
    }, [loadChats])

    // Inicializar estado do chatClosedByUser baseado no localStorage
    useEffect(() => {
        setChatClosedByUser(getChatClosedByUser())
    }, [getChatClosedByUser])

    const contextValue: ChatContextType = {
        // Estado
        chats,
        currentChat,
        isLoading,
        error,
        isGenerating,
        streamingMessage,

        // Ações de Chat
        createChat,
        loadChats,
        loadArchivedChats,
        selectChat,
        closeChat,
        deleteChat,
        updateChatTitle,
        archiveChat,
        unarchiveChat,

        // Ações de Mensagem
        sendMessage,
        addMessage,
        clearMessages,

        // Configurações
        availableModels,
        changeLLMModel,
        selectedModel,
        setSelectedModel,

        // Utilities
        clearError,
        regenerateLastResponse,

        // Command Palette
        isCommandPaletteOpen,
        setCommandPaletteOpen: setIsCommandPaletteOpen,
    }

    return (
        <ChatContext.Provider value={contextValue}>
            <CommandPalette />
            {children}
        </ChatContext.Provider>
    )
}

export default ChatProvider