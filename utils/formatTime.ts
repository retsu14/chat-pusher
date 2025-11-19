export const formatTime = (timestamp: string) => {
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
