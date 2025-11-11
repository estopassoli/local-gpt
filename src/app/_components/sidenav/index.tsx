'use client';
import { useSidenav } from "@/contexts/sidenav-context";
import { cn } from "@/lib/utils";
import SidenavBody from "./body";
import SidenavFooter from "./footer";
import SidenavHeader from "./header";

export default function Sidenav({ className }: { className?: string }) {
    const { open } = useSidenav();
    return (
        <div className={cn(className, "w-80 h-full border-r border-accent flex flex-col transition-all duration-200 group shadow-2xl bg-card/50",
            !open && "w-16"
        )}>
            <SidenavHeader />
            <SidenavBody />
            <SidenavFooter />
        </div>
    )
}
