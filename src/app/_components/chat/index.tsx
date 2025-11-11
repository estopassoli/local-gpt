'use client';
import { useChat } from "@/contexts/chat-context";
import { useUser } from "@/contexts/user-context";
import { useEffect, useState } from "react";
import Header from "./header";
import ChatInput from "./input";
import MessageList from "./message-list";

export default function Chat() {
    const { name } = useUser();
    const { currentChat } = useChat()
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            setIsScrolled(scrollTop > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [])

    const messages = [
        `Bem vindo de volta, ${(name || 'Usuário')}!`,
        `Que bom te ver, ${name || 'Usuário'}.`,
        `Olá ${name || 'Usuário'}, como posso ajudar você hoje?`,
        `O que tem na agenda de hoje?`,
        `Pronto para mais uma sessão de chat, ${name || 'Usuário'}?`
    ]
    return !currentChat ? (
        <main className="w-full h-full bg-card flex flex-col bg-linear-to-b from-background to-card relative">
            <Header isScrolled={isScrolled} />
            <div className="flex-1 flex items-center justify-center">
                <div className="max-w-4xl w-full p-8 text-center">
                    <h1 className="text-2xl mb-4">
                        {messages[Math.floor(Math.random() * messages.length)]}
                    </h1>
                    <ChatInput />
                </div>
            </div>
        </main>
    ) : (
        <main className="w-full h-full bg-linear-to-b from-background to-card flex flex-col relative">
            <Header isScrolled={isScrolled} />
            <MessageList />
            <ChatInput />
        </main>
    )
}