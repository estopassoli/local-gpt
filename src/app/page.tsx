import ChatProvider from "@/contexts/chat-context";
import Chat from "./_components/chat";
import Sidenav from "./_components/sidenav";

export default function Home() {
  return <ChatProvider>
    <Sidenav />
    <Chat />
  </ChatProvider>;
}
