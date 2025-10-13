"use client";

import { useEffect, useState } from "react";
import { pusherClient } from "@/utils/pusherClient";
import api from "@/utils/api";
import MessageList from "@/components/MessageList";
import MessageInput from "@/components/MessageInput";
import TypingIndicator from "@/components/TypingIndicator";

interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  [key: string]: any;
}

interface TypingEventData {
  userId: string;
  username: string;
  isTyping: boolean;
  [key: string]: any;
}

interface ChatPageProps {
  params: {
    slug: string;
  };
}

export default function ChatPage({ params }: ChatPageProps) {
  const { slug } = params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ user: object | null }>({
    user: null,
  });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get("/api/auth/me", { withCredentials: true });
        setCurrentUser(res.data.user);
      } catch (err) {
        console.error("Not logged in:", err);
        setCurrentUser({ user: null });
      }
    };

    fetchCurrentUser();
  }, []);

  console.log("currentUser", currentUser);

  // 🔁 Fetch & Realtime Subscription
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/api/message/threads/${slug}`);
        setMessages(res.data.data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();

    const channel = pusherClient.subscribe(`chat_${currentUser.id}`);

    channel.bind("message", (message: Message) => {
      if (message.senderId === slug || message.receiverId === slug) {
        setMessages((prev) => [...prev, message]);
      }
    });

    channel.bind("typing", (data: TypingEventData) => {
      if (data.userId === slug) {
        if (data.isTyping) {
          setTypingUser(data.username);
          setTimeout(() => setTypingUser(null), 2000);
        } else {
          setTypingUser(null);
        }
      }
    });

    return () => {
      pusherClient.unsubscribe(`chat_${currentUser.id}`);
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [slug, currentUser.id]);

  // ✉️ Send Message
  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    try {
      await api.post("/api/message/send", { receiverId: slug, text });
    } catch (err) {
      console.error("Send message failed:", err);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-4">Chat with {slug}</h1>
      <MessageList messages={messages} currentUser={currentUser} />
      <TypingIndicator username={typingUser ?? ""} />
      <MessageInput onSend={handleSend} />
    </div>
  );
}
