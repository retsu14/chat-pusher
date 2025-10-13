"use client";

interface TypingIndicatorProps {
  username: string;
}

export default function TypingIndicator({ username }: TypingIndicatorProps) {
  if (!username) return null;
  return (
    <div className="text-sm text-gray-500 italic mt-1">
      {username} is typing...
    </div>
  );
}
