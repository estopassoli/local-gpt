import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@/contexts/chat-context";
import { cn } from "@/lib/utils";
import { ArrowUp, Mic } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ChatInput() {
    const [message, setMessage] = useState("")
    const [isRecording, setIsRecording] = useState(false)
    const { sendMessage, isGenerating, currentChat, createChat, updateChatTitle, changeLLMModel, selectedModel, availableModels } = useChat()
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim() || isGenerating) return

        const messageToSend = message.trim()
        setMessage("")

        try {
            // Se não há chat ativo, criar um novo automaticamente
            if (!currentChat) {
                console.log("🚀 Iniciando criação de novo chat...")

                // Criar novo chat
                const newChat = await createChat()
                console.log("✅ Chat criado com sucesso:", newChat)

                // Gerar título baseado no início da mensagem
                const chatTitle = messageToSend.length > 50
                    ? messageToSend.substring(0, 47) + "..."
                    : messageToSend

                // Definir título do chat
                await updateChatTitle(newChat.id, chatTitle)
                console.log("📝 Título atualizado:", chatTitle)

                // Definir modelo se houver um selecionado
                if (selectedModel || availableModels[0]) {
                    const modelToUse = selectedModel || availableModels[0]
                    try {
                        console.log("🔧 Definindo modelo:", modelToUse)
                        await changeLLMModel(modelToUse)
                        console.log("✅ Modelo definido com sucesso")
                    } catch (error) {
                        console.log("⚠️ Erro ao definir modelo, continuando...", error)
                    }
                }

                console.log("💬 Enviando mensagem para o novo chat:", newChat.id)
                console.log("📨 Conteúdo da mensagem:", messageToSend)

                // Enviar mensagem para o novo chat
                await sendMessage(messageToSend, newChat.id)
                console.log("✅ Mensagem enviada com sucesso!")
            } else {
                console.log("💬 Enviando mensagem para chat existente:", currentChat.id)
                // Chat já existe, apenas enviar mensagem
                await sendMessage(messageToSend)
                console.log("✅ Mensagem enviada com sucesso!")
            }
        } catch (error) {
            console.error("❌ Erro ao enviar mensagem:", error)
            // Restaurar mensagem em caso de erro
            setMessage(messageToSend)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    const handleVoiceRecord = () => {
        setIsRecording(!isRecording)
        // TODO: Implementar gravação de voz
    }

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
            const newHeight = Math.min(textareaRef.current.scrollHeight, 120)
            textareaRef.current.style.height = `${newHeight}px`
        }
    }

    useEffect(() => {
        adjustTextareaHeight()
    }, [message])

    return (
        <div className={cn("p-4 sticky bottom-0 2xl:w-1/3 xl:w-2/5 lg:w-2/3 max-lg:w-[90%] mx-auto", !currentChat && "lg:min-w-200")}>
            <form onSubmit={handleSubmit} className="relative">
                <div className="flex items-end bg-muted/30 backdrop-blur-sm rounded-3xl border border-border/30 p-2 shadow-sm min-h-14">
                    {/* Container do Textarea */}
                    <div className="flex-1 min-w-0">
                        <Textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={currentChat ? "Pergunte alguma coisa..." : "Comece um novo chat..."}
                            className="w-full resize-none border-0 bg-transparent! focus-visible:ring-0 shadow-none focus-visible:ring-offset-0 placeholder:text-muted-foreground/70 text-sm py-3 px-3 min-h-10 leading-relaxed overflow-y-auto"
                            style={{
                                height: "44px",
                                scrollbarWidth: "none",
                                msOverflowStyle: "none",
                                maxHeight: "120px"
                            }}
                            disabled={isGenerating}
                            rows={1}
                        />
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center gap-1 self-end mb-1">
                        {message.trim() ? (
                            <Button
                                type="submit"
                                size="icon"
                                className="shrink-0 rounded-full h-9 w-9 bg-primary hover:bg-primary/90"
                                disabled={isGenerating}
                            >
                                <ArrowUp className="h-4 w-4" />
                            </Button>
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 rounded-full h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    onClick={handleVoiceRecord}
                                >
                                    <Mic className="h-4 w-4" />
                                </Button>

                                {/* Indicador de gravação - Barras de áudio animadas */}
                                {isRecording && (
                                    <div className="flex items-center gap-0.5 px-3">
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-0.5 bg-red-500 rounded-full animate-pulse"
                                                style={{
                                                    height: `${6 + Math.sin(Date.now() * 0.005 + i * 0.8) * 8}px`,
                                                    animationDelay: `${i * 100}ms`,
                                                    animationDuration: `${800 + i * 100}ms`
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Indicador de loading */}
                {isGenerating && (
                    <div className="flex items-center justify-center mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                            <span className="ml-2">Pensando...</span>
                        </div>
                    </div>
                )}
            </form>
        </div>
    )
}
