export type Message = {
  id: string | number;
  senderId: string | number;
  text: string;
};

export type User = {
  id: string | number;
};

export interface MessageListProps {
  messages: Message[];
  currentUser: User;
}
