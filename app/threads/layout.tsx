import ChatList from "@/components/ChatList";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen p-5 bg-[#171717] text-white gap-[20px]">
      <ChatList />
      <main className="grow text-white">{children}</main>
    </div>
  );
};

export default layout;
