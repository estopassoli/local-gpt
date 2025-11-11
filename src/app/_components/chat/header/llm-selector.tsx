'use client';

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useChat } from "@/contexts/chat-context";
import { ChevronDown, DownloadCloudIcon } from "lucide-react";
import Link from "next/link";

export default function LLMSelector() {
    const { availableModels, selectedModel, setSelectedModel, currentChat } = useChat();

    const currentSelectedModel = currentChat?.llmModel || selectedModel;

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="lg">
                        <p>{currentSelectedModel || "Nenhum modelo disponível"}</p>
                        <ChevronDown className="ml-2 size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="start">
                    {availableModels.map(model => (
                        <DropdownMenuCheckboxItem key={model} checked={currentSelectedModel === model} onCheckedChange={() => {
                            setSelectedModel(model);
                            console.log("Modelo selecionado:", model);
                        }}>
                            {model}
                        </DropdownMenuCheckboxItem>
                    ))}
                    <DropdownMenuSeparator />
                    <Link href="https://ollama.com/search" target="_blank" rel="noreferrer">
                        <DropdownMenuItem>
                            <DownloadCloudIcon />
                            <p>Buscar mais modelos...</p>
                        </DropdownMenuItem>
                    </Link>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
