export interface User {
  id: string;
  username: string;
}

export interface Message {
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

export interface ChatComponentProps {
  currentUserId: string;
  peerId: string;
  pusherClient: any; // You can replace with Pusher type if installed
}
