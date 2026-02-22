export interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface Comment {
  id: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface Gift {
  id: string;
  senderId: string;
  receiverId: string;
  item: string;
  timestamp: number;
  tips: number;
  comments: Comment[];
}
