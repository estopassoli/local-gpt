'use client';

import { ScrollArea } from "@/components/ui/scroll-area";
import type { Message } from "@/contexts/chat-context";
import { useChat } from "@/contexts/chat-context";
import { useAutoScroll } from "@/hooks/use-auto-scroll-new";
import { useEffect, useRef } from "react";
import MessageContent from "./message-content";

export default function MessageList() {
    const { currentChat, isGenerating, streamingMessage } = useChat();
    const messages = currentChat?.messages || [];
    const hasScrolledToBottom = useRef<string | null>(null);

    // Hook para auto-scroll quando há novas mensagens ou streaming
    const { scrollAreaRef, scrollToBottomInstant, scrollToBottom } = useAutoScroll({
        dependency: [messages.length, streamingMessage],
        behavior: 'smooth',
        enabled: true,
        threshold: 100
    });

    // Scroll automático e imediato quando entrar em um chat
    useEffect(() => {
        const chatId = currentChat?.id;
        if (chatId && messages.length > 0) {
            // Se é um chat diferente do último que fizemos scroll
            if (hasScrolledToBottom.current !== chatId) {
                hasScrolledToBottom.current = chatId;
                
                // Fazer scroll imediato para garantir que vai para o fim
                setTimeout(() => {
                    scrollToBottomInstant();
                }, 0);
                
                // Segundo scroll com delay para garantir que o DOM foi renderizado
                setTimeout(() => {
                    scrollToBottomInstant();
                }, 100);
            }
        }
    }, [currentChat?.id, messages.length, scrollToBottomInstant]);

    // Auto-scroll durante streaming
    useEffect(() => {
        if (streamingMessage) {
            // Durante streaming, fazer scroll suave mais frequente
            const intervalId = setInterval(() => {
                scrollToBottom();
            }, 100);

            return () => clearInterval(intervalId);
        }
    }, [streamingMessage, scrollToBottom]);

    return (
        <ScrollArea ref={scrollAreaRef} className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>Inicie uma conversa...</p>
                    </div>
                ) : (
                    messages.map((message: Message) => (
                        <div key={message.id} className="flex w-full">
                            {message.role === 'USER' ? (
                                // Mensagem do usuário - bubble na direita
                                <div className="flex justify-end w-full">
                                    <div className="max-w-[80%] bg-primary/10 text-secondary-foreground rounded-2xl px-4 py-3 ml-12">
                                        <MessageContent
                                            content={message.content}
                                            role={message.role as 'USER' | 'ASSISTANT'}
                                        />
                                    </div>
                                </div>
                            ) : (
                                // Mensagem da IA - da esquerda para a direita, sem bubble
                                <div className="flex justify-start w-full">
                                    <div className="max-w-[85%] mr-12">
                                        <MessageContent
                                            content={message.content}
                                            role={message.role as 'USER' | 'ASSISTANT'}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}

                {/* Mensagem de streaming */}
                {isGenerating && streamingMessage && (
                    <div className="flex justify-start w-full">
                        <div className="max-w-[85%] mr-12">
                            <div className="relative">
                                <MessageContent
                                    content={streamingMessage}
                                    role="ASSISTANT"
                                />
                                {/* Cursor piscante para indicar que está digitando */}
                                <div className="inline-block w-2 h-5 bg-primary animate-pulse ml-1"></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Indicador de digitação quando não há streaming */}
                {isGenerating && !streamingMessage && (
                    <div className="flex justify-start w-full">
                        <div className="max-w-[85%] mr-12">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                                </div>
                                <span className="text-sm">Pensando...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}
