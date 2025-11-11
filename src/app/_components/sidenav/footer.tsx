'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSidenav } from "@/contexts/sidenav-context";
import { useUser } from "@/contexts/user-context";
import { cn } from "@/lib/utils";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

export default function SidenavFooter() {
    const { name } = useUser();
    const { open } = useSidenav();
    const { theme, setTheme } = useTheme();
    return (
        <footer className={cn("p-4 border-t border-accent flex items-center gap-2 mt-auto", !open && "flex-col gap-2")}>
            <Button variant="ghost" size={open ? "lg" : "icon"} className={cn(open ? "flex-1 items-center justify-start p-2 py-7" : "p-3")}>
                <Avatar className={open ? "w-10 h-10" : "w-6 h-6"}>
                    <AvatarImage src="/default.png" alt="default avatar" />
                    <AvatarFallback>
                        {name ? name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                </Avatar>
                <p className={cn("ml-3 font-medium", open ? "block" : "hidden")}>
                    {name || 'User'}
                </p>
            </Button>
            <Button className="size-8" variant="ghost" onClick={() => {
                setTheme(theme === 'light' ? 'dark' : 'light')
            }}>
                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </Button>
        </footer>
    )
}
