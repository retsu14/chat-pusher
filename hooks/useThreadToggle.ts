import { useState } from "react";

export const useThreadToggle = () => {
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(
    new Set()
  );

  const toggleThread = (messageId: string) => {
    setExpandedThreads((prev) => {
      const newSet = new Set(prev);
      newSet.has(messageId) ? newSet.delete(messageId) : newSet.add(messageId);
      return newSet;
    });
  };

  return { expandedThreads, toggleThread };
};
