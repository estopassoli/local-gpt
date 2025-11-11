import { SidenavProvider } from "@/contexts/sidenav-context";
import { UserProvider } from "@/contexts/user-context";
import { ThemeProvider } from "@/providers/theme-provider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: `LocalGPT - ${process.env.NEXT_PUBLIC_USERNAME || 'Your Local LLM Assistant'}`,
  description: "Local GPT - Use locally your own LLM models",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <UserProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >

            <main className="w-screen h-screen flex">
              <SidenavProvider>
                {children}
              </SidenavProvider>
            </main>
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}
