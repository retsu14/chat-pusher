import React, { useState, useEffect, useRef } from "react";
import { Send, Reply, Eye } from "lucide-react";

interface User {
  id: string;
  username: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  isRead?: boolean;
  parentId?: string | null;
  parent?: Message;
  replies?: Message[];
  sender: User;
  _count: {
    replies: number;
  };
}

interface ChatComponentProps {
  currentUserId: string;
  peerId: string;
  pusherClient: any; // You can replace with Pusher type if installed
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  currentUserId,
  peerId,
  pusherClient,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(
    new Set()
  );
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch conversation threads
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages/threads/${peerId}`, {
          method: "GET",
          credentials: "include", // ✅ send cookies with request
        });
        const data = await response.json();
        if (data.success) {
          setMessages(data.data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [peerId]);

  // Set up Pusher listeners
  useEffect(() => {
    if (!pusherClient) return;

    const channel = pusherClient.subscribe(`chat_${currentUserId}`);

    // Listen for new messages
    channel.bind("message", (message: Message) => {
      setMessages((prev) => {
        if (message.parentId) {
          // Handle reply
          return prev.map((msg) => {
            if (msg.id === message.parentId) {
              return {
                ...msg,
                replies: [...(msg.replies || []), message],
                _count: { replies: (msg._count?.replies || 0) + 1 },
              };
            }
            return msg;
          });
        } else {
          // Handle new top-level message
          return [...prev, message];
        }
      });
    });

    // Listen for typing indicators
    channel.bind(
      "typing",
      ({
        userId,
        username,
        isTyping,
      }: {
        userId: string;
        username: string;
        isTyping: boolean;
      }) => {
        if (userId !== currentUserId) {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            if (isTyping) {
              newSet.add(username);
            } else {
              newSet.delete(username);
            }
            return newSet;
          });

          // Auto-clear typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers((prev) => {
              const newSet = new Set(prev);
              newSet.delete(username);
              return newSet;
            });
          }, 3000);
        }
      }
    );

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`chat_${currentUserId}`);
    };
  }, [pusherClient, currentUserId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 2000);
  };

  const sendTypingIndicator = async (typing: boolean) => {
    try {
      await fetch("/api/messages/typing", {
        method: "POST",
        credentials: "include", // ✅ send cookies with request
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          peerId,
          isTyping: typing,
        }),
      });
    } catch (error) {
      console.error("Error sending typing indicator:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        credentials: "include", // ✅ send cookies with request
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: peerId,
          text: newMessage,
          parentId: replyingTo?.id,
        }),
      });

      if (response.ok) {
        setNewMessage("");
        setReplyingTo(null);
        setIsTyping(false);
        sendTypingIndicator(false);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const toggleThread = (messageId: string) => {
    setExpandedThreads((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const MessageBubble: React.FC<{ message: Message; isReply?: boolean }> = ({
    message,
    isReply = false,
  }) => {
    const isOwnMessage = message.senderId === currentUserId;

    return (
      <div
        className={`flex ${
          isOwnMessage ? "justify-end" : "justify-start"
        } mb-2 ${isReply ? "ml-8" : ""}`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isOwnMessage
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          } ${isReply ? "border-l-4 border-gray-400 bg-opacity-80" : ""}`}
        >
          {message.parent && (
            <div className="text-xs opacity-70 mb-1 italic">
              Replying to: {message.parent.text.substring(0, 50)}...
            </div>
          )}

          <div className="font-medium text-sm">
            {isOwnMessage ? "You" : message.sender.username}
          </div>

          <div className="mt-1">{message.text}</div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs opacity-70">
              {formatTime(message.createdAt)}
            </span>

            {!isReply && (
              <div className="flex items-center space-x-2">
                {message._count.replies > 0 && (
                  <button
                    onClick={() => toggleThread(message.id)}
                    className="text-xs opacity-70 hover:opacity-100"
                  >
                    {expandedThreads.has(message.id) ? "Hide" : "Show"} replies
                    ({message._count.replies})
                  </button>
                )}

                <button
                  onClick={() => setReplyingTo(message)}
                  className="text-xs opacity-70 hover:opacity-100"
                >
                  <Reply size={12} />
                </button>

                {message.isRead && isOwnMessage && (
                  <Eye size={12} className="opacity-50" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-96 bg-white rounded-lg shadow-lg">
      <div className="bg-gray-50 px-4 py-2 rounded-t-lg border-b">
        <h3 className="font-semibold">Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message) => (
          <div key={message.id}>
            <MessageBubble message={message} />

            {expandedThreads.has(message.id) && message.replies && (
              <div className="ml-4 border-l-2 border-gray-200 pl-4">
                {message.replies.map((reply) => (
                  <MessageBubble
                    key={reply.id}
                    message={reply}
                    isReply={true}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {typingUsers.size > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm">
              {Array.from(typingUsers).join(", ")}{" "}
              {typingUsers.size === 1 ? "is" : "are"} typing...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {replyingTo && (
        <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Replying to:{" "}
              <span className="font-medium">
                {replyingTo.text.substring(0, 50)}...
              </span>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={
              replyingTo ? "Type your reply..." : "Type a message..."
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
