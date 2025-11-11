import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useChat } from "@/contexts/chat-context";
import { useSidenav } from "@/contexts/sidenav-context";
import { cn } from "@/lib/utils";
import { Chat } from "@prisma/client";
import { FolderArchive, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { useEffect, useState } from "react";

export default function SidenavBody() {
    const { open } = useSidenav();

    return (
        <main className={cn("flex-1 p-2", open ? "block" : "hidden")}>
            <span className="text-sm text-muted-foreground">
                Chats
            </span>
            <Chats />

        </main>
    )
}

const Chats = () => {
    const { chats, loadChats } = useChat();

    useEffect(() => {
        loadChats();
    }, [loadChats])

    return (
        <div className="mt-4">
            {chats.map(chat => (
                <ChatItem key={chat.id} chat={chat} />
            ))}
        </div>
    )
}

const ChatItem = ({ chat }: { chat: Chat }) => {
    const { currentChat, selectChat, deleteChat, updateChatTitle, archiveChat } = useChat();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleDeleteConfirm = () => {
        deleteChat(chat.id);
        setDeleteDialogOpen(false);
    };

    return (<div onClick={() => selectChat(chat.id)} className={cn(
        "rounded-xl p-2 pl-4 mb-2 flex items-center cursor-pointer hover:dark:bg-accent/30 hover:bg-accent/80 group",
        currentChat?.id === chat.id && "dark:bg-accent/30 bg-accent/80"
    )}>
        <div className="flex flex-col">
            <span className="truncate flex-nowrap text-nowrap text-xs font-bold max-w-40">{chat.title || "Chat sem título"}</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button onClick={(e) => e.stopPropagation()} className="size-6 opacity-0 group-hover:opacity-100 transition-opacity" size="icon" variant="ghost">
                        <MoreHorizontal className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={(e) => {
                        e.stopPropagation()
                        const newTitle = prompt("Novo título para o chat:", chat.title);
                        if (newTitle !== null) {
                            updateChatTitle(chat.id, newTitle);
                        }
                    }}>
                        <Pencil />
                        <span>Renomear</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={(e) => {
                        e.stopPropagation()
                        archiveChat(chat.id)
                    }}>
                        <FolderArchive />
                        <span>Arquivar</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={(e) => {
                        e.stopPropagation()
                        setDeleteDialogOpen(true)
                    }} variant="destructive">
                        <Trash />
                        <span>Excluir</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirmar exclusão</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir o chat &ldquo;{chat.title || 'Chat sem título'}&rdquo;?
                            Esta ação não pode ser desfeita e todas as mensagens serão perdidas.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                        >
                            Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    </div >)
}