"use client";

import { useEffect, useRef } from "react";
import { Message, User, MessageListProps } from "@/types/message-list";

export default function MessageList({
  messages,
  currentUser,
}: MessageListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div
      ref={scrollContainerRef}
      className="rounded-lg flex flex-col  gap-2 flex-1 overflow-y-auto p-4 bg-[#1f1f1f] custom-scroll scroll-smooth"
    >
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${
            msg.senderId === currentUser.id ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`px-3 py-2 rounded-lg max-w-[500px] break-words ${
              msg.senderId === currentUser.id
                ? "bg-blue-500 text-white"
                : "bg-[#3b3c3d] text-white"
            }`}
          >
            {msg.text}
          </div>
        </div>
      ))}
    </div>
  );
}
