"use client";
import { useState } from "react";

interface MessageInputProps {
  onSend: (text: string) => void;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="flex items-center gap-[20px]">
      <input
        className="flex-1 rounded-lg px-3 py-3 bg-[#1f1f1f] focus:outline-none"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={handleSend}
        className="bg-blue-500 text-white px-4 py-3 rounded-lg"
      >
        Send
      </button>
    </div>
  );
}
