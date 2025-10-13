"use client";

type Message = {
  id: string | number;
  senderId: string | number;
  text: string;
};

type User = {
  id: string | number;
};

interface MessageListProps {
  messages: Message[];
  currentUser: User;
}

export default function MessageList({
  messages,
  currentUser,
}: MessageListProps) {
  return (
    <div className="flex flex-col gap-2 overflow-y-auto h-[400px] p-4 border rounded-md">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${
            msg.senderId === currentUser.id ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`px-3 py-2 rounded-lg ${
              msg.senderId === currentUser.id
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            {msg.text}
          </div>
        </div>
      ))}
    </div>
  );
}
