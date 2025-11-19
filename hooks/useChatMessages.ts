"use client";
import { useEffect, useState, useRef } from "react";
import { Message } from "@/types/chat-types";

export const useChatMessages = (
  currentUserId: string,
  peerId: string,
  pusherClient: any
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages/threads/${peerId}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) setMessages(data.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, [peerId]);

  useEffect(() => {
    if (!pusherClient) return;
    const channel = pusherClient.subscribe(`chat_${currentUserId}`);

    channel.bind("message", (message: Message) => {
      setMessages((prev) => {
        if (message.parentId) {
          return prev.map((msg) =>
            msg.id === message.parentId
              ? {
                  ...msg,
                  replies: [...(msg.replies || []), message],
                  _count: { replies: (msg._count?.replies || 0) + 1 },
                }
              : msg
          );
        }
        return [...prev, message];
      });
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`chat_${currentUserId}`);
    };
  }, [pusherClient, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return { messages, setMessages, messagesEndRef };
};
