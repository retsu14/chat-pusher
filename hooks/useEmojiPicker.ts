import { useState, useRef } from "react";

export const useEmojiPicker = (setNewMessage: (fn: any) => void) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const addEmoji = (emoji: string) => {
    setNewMessage((prev: string) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  return { showEmojiPicker, setShowEmojiPicker, addEmoji, inputRef };
};
