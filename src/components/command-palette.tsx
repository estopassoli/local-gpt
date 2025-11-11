'use client'

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { useChat } from "@/contexts/chat-context"
import { MessageSquare, Plus } from "lucide-react"

export function CommandPalette() {
  const { 
    chats, 
    isCommandPaletteOpen, 
    setCommandPaletteOpen, 
    selectChat,
    createChat 
  } = useChat()

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId)
    setCommandPaletteOpen(false)
  }

  const handleCreateNewChat = () => {
    createChat()
    setCommandPaletteOpen(false)
  }

  const formatDate = (date: string | Date) => {
    const d = new Date(date)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) {
      return `Hoje às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffInDays === 1) {
      return `Ontem às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffInDays < 7) {
      return `${diffInDays} dias atrás`
    } else {
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
    }
  }

  return (
    <CommandDialog open={isCommandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput placeholder="Buscar chats ou criar novo... (CTRL+K)" />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        
        <CommandGroup heading="Ações Rápidas">
          <CommandItem onSelect={handleCreateNewChat} className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            <div className="flex flex-col">
              <span className="font-medium">Criar novo chat</span>
              <span className="text-xs text-muted-foreground">CTRL+SHIFT+O</span>
            </div>
          </CommandItem>
        </CommandGroup>

        {chats.length > 0 && (
          <CommandGroup heading={`Chats Recentes (${chats.length})`}>
            {chats.slice(0, 10).map((chat) => (
              <CommandItem
                key={chat.id}
                onSelect={() => handleSelectChat(chat.id)}
                value={`${chat.title} ${chat.llmModel} ${chat.id}`}
                className="cursor-pointer"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                <div className="flex flex-col flex-1">
                  <span className="font-medium truncate">
                    {chat.title || 'Chat sem título'}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{chat.llmModel}</span>
                    <span>•</span>
                    <span>{chat.messages.length} mensagens</span>
                    <span>•</span>
                    <span>{formatDate(chat.updatedAt)}</span>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
