"use client";
import React, { useState, useEffect, useRef } from "react";
import { Send, Reply, Smile, Paperclip, X, Heart } from "lucide-react";
import { Message } from "@/types/chat-types";
import CallIcon from "./icons/CallIcon";
import VideoIcon from "./icons/VideoIcon";
import InfoIcon from "./icons/InfoIcon";

// Props interface
interface ChatComponentProps {
  currentUserId: string;
  peerId: string;
  peerName: string;
  peerAvatar?: string;
  pusherClient: any; // You can replace with proper Pusher type if available
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  currentUserId,
  peerId,
  peerName,
  peerAvatar,
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
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const emojis = [
    "😀",
    "😂",
    "😍",
    "🥺",
    "😭",
    "😡",
    "👍",
    "👎",
    "❤️",
    "🔥",
    "💯",
    "🎉",
  ];

  // Fetch conversation threads
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages/threads/${peerId}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (data.success) {
          setMessages(data.data as Message[]);
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
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
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
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
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

  const addEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (Number(now) - Number(messageTime)) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return messageTime.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  // Subcomponent
  const MessageBubble: React.FC<{ message: Message; isReply?: boolean }> = ({
    message,
    isReply = false,
  }) => {
    const isOwnMessage = message.senderId === currentUserId;

    return (
      <div
        className={`flex ${
          isOwnMessage ? "justify-end" : "justify-start"
        } mb-1 ${isReply ? "ml-12" : ""}`}
      >
        <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
          {!isOwnMessage && !isReply && (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
              {message.sender.username.charAt(0).toUpperCase()}
            </div>
          )}

          <div
            className={`px-3 py-2 rounded-2xl relative group ${
              isOwnMessage
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                : "bg-gray-100 text-gray-800 rounded-bl-md"
            } ${isReply ? "border-l-4 border-blue-300 bg-opacity-80" : ""}`}
          >
            {message.parent && (
              <div
                className={`text-xs mb-2 p-2 rounded-lg ${
                  isOwnMessage ? "bg-blue-400 bg-opacity-50" : "bg-gray-200"
                }`}
              >
                <div className="font-medium">
                  {message.parent.sender.username}
                </div>
                <div className="opacity-80">
                  {message.parent.text.substring(0, 50)}...
                </div>
              </div>
            )}

            <div className="break-words">{message.text}</div>

            <div className="flex items-center justify-between mt-1">
              <span
                className={`text-xs ${
                  isOwnMessage ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {formatTime(message.createdAt)}
              </span>

              {message.isRead && isOwnMessage && (
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>

            {!isReply && (
              <div className="absolute -bottom-6 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full shadow-lg border flex items-center p-1 space-x-1">
                <button
                  onClick={() => setReplyingTo(message)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                  title="Reply"
                >
                  <Reply size={12} className="text-gray-600" />
                </button>
                <button
                  className="p-1 hover:bg-gray-100 rounded-full"
                  title="React"
                >
                  <Heart size={12} className="text-red-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-40px)] rounded-xl bg-[#1f1f1f] ">
      {/* Header */}
      <div className="text-white  px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
            {peerName ? peerName.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h3 className="font-semibold text-[15px]">{peerName || "User"}</h3>
            <p className="text-[13px] text-green-500">Active now</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <CallIcon className="text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <VideoIcon className="text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <InfoIcon className="text-gray-400 h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1f1f1f]">
        {messages.map((message) => (
          <div key={message.id}>
            <MessageBubble message={message} />

            {message._count?.replies > 0 && (
              <div className="flex justify-start ml-12 mt-2">
                <button
                  onClick={() => toggleThread(message.id)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                >
                  <Reply size={14} />
                  <span>
                    {expandedThreads.has(message.id) ? "Hide" : "View"}{" "}
                    {message._count.replies}{" "}
                    {message._count.replies === 1 ? "reply" : "replies"}
                  </span>
                </button>
              </div>
            )}

            {expandedThreads.has(message.id) && message.replies && (
              <div className="mt-3 space-y-2 border-l-2 border-gray-200 ml-6 pl-6">
                {message.replies.map((reply) => (
                  <MessageBubble key={reply.id} message={reply} isReply />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {typingUsers.size > 0 && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-sm font-medium">
                {Array.from(typingUsers)[0].charAt(0).toUpperCase()}
              </div>
              <div className="bg-gray-200 px-4 py-2 rounded-2xl rounded-bl-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply preview */}
      {replyingTo && (
        <div className="px-4 py-3 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Reply size={16} className="text-blue-600" />
              <div>
                <div className="text-sm text-blue-600 font-medium">
                  Replying to {replyingTo.sender.username}
                </div>
                <div className="text-sm text-gray-600 truncate max-w-xs">
                  {replyingTo.text}
                </div>
              </div>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 ">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <input
                ref={inputRef}
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
                className="flex-1 bg-transparent outline-none  placeholder-gray-500"
              />
              <div className="flex items-center space-x-2 ml-3">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1 hover:bg-gray-200 rounded-full"
                >
                  <Smile size={20} className="text-blue-500" />
                </button>
                <button className="p-1 hover:bg-gray-200 rounded-full">
                  <Paperclip size={20} className="text-blue-500" />
                </button>
              </div>
            </div>

            {showEmojiPicker && (
              <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-2xl shadow-lg p-3 grid grid-cols-6 gap-2">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => addEmoji(emoji)}
                    className="text-2xl hover:bg-gray-100 rounded-lg p-2 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
