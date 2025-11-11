'use client';
import { Button } from "@/components/ui/button";
import { useChat } from "@/contexts/chat-context";
import { useSidenav } from "@/contexts/sidenav-context";
import { cn } from "@/lib/utils";
import { Edit, GitPullRequest, PanelLeft, PanelRight, Search } from "lucide-react";

export default function SidenavHeader() {
    const { toggleSidenav, open } = useSidenav();
    const { currentChat, createChat, closeChat } = useChat();

    return (
        <header className={cn("p-3")}>
            <div className={cn("flex items-center justify-between", open ? "" : "flex-col")}>
                <Button size="icon" variant="ghost" className={cn(!open && "group-hover:hidden")} onClick={() => {
                    if (currentChat) {
                        closeChat()
                    }
                }} title="Fechar chat atual">
                    <GitPullRequest />
                </Button>
                <Button size="icon" variant="ghost" onClick={toggleSidenav} aria-label="Toggle Sidenav" className={cn(!open && "group-hover:flex hidden")}>
                    {open ? (<PanelLeft />) : (<PanelRight />)}
                </Button>
            </div>
            <div className={cn("my-4 flex flex-col", !open && "items-center justify-center")}>
                <Button onClick={() => createChat()} className={cn(open && "justify-start flex items-center")} variant="ghost" size={open ? "default" : "icon"} >
                    <Edit />
                    <p className={cn(!open && "hidden")}>Novo chat</p>
                    <span className={cn(!open && "hidden", "ml-auto text-xs text-muted-foreground")}>
                        <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>O</kbd>
                    </span>
                </Button>

                <Button className={cn(open && "justify-start flex items-center")} variant="ghost" size={open ? "default" : "icon"} >
                    <Search />
                    <p className={cn(!open && "hidden")}>Buscar em chats</p>
                    <span className={cn(!open && "hidden", "ml-auto text-xs text-muted-foreground")}>
                        <kbd>Ctrl</kbd> + <kbd>K</kbd>
                    </span>
                </Button>
            </div>
        </header>
    )
}