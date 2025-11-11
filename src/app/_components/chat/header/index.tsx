'use client';
import { Button } from "@/components/ui/button";
import { useChat } from "@/contexts/chat-context";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import LLMSelector from "./llm-selector";

export default function Header({ isScrolled }: { isScrolled: boolean }) {
    const { currentChat, closeChat } = useChat();

    const handleCloseChat = () => {
        if (currentChat) {
            closeChat();
        }
    };

    return (
        <header className={cn(
            "flex items-center justify-between gap-2 px-4 py-3 sticky top-0 z-50 transition-all duration-200 min-h-16 w-full",
            isScrolled && "bg-background/80 backdrop-blur-sm border-b shadow-xl"
        )}>
            <div className="flex items-center gap-2">
                <LLMSelector />
                {currentChat && (
                    <span className="text-sm text-muted-foreground">
                        {currentChat.title || 'Conversa sem título'}
                    </span>
                )}
            </div>
            
            {currentChat && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseChat}
                    title="Fechar chat"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </header>
    )
}
