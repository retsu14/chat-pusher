import { useState, useRef, useEffect } from "react";

export const useTyping = (
  currentUserId: string,
  peerId: string,
  pusherClient: any
) => {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sendTypingIndicator = async (typing: boolean) => {
    try {
      await fetch("/api/messages/typing", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peerId, isTyping: typing }),
      });
    } catch (err) {
      console.error("Error sending typing:", err);
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 2000);
  };

  useEffect(() => {
    if (!pusherClient) return;

    const channel = pusherClient.subscribe(`chat_${currentUserId}`);

    channel.bind("typing", ({ username, isTyping }) => {
      setTypingUsers((prev) => {
        const updated = new Set(prev);
        if (isTyping) updated.add(username);
        else updated.delete(username);
        return updated;
      });

      setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = new Set(prev);
          updated.delete(username);
          return updated;
        });
      }, 3000);
    });

    return () => {
      channel.unbind("typing");
    };
  }, [pusherClient, currentUserId]);

  return {
    typingUsers,
    isTyping,
    handleTyping,
    sendTypingIndicator,
  };
};
