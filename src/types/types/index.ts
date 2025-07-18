export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  bio: string;
  followers: string[];
  following: string[];
  posts: string[];
  createdAt: Date;
  isVerified: boolean;
  isPrivate: boolean;
}

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export interface Post {
  id: string;
  userId: string;
  content: string;
  images?: string[];
  videoUrl?: string;
  audioUrl?: string;
  reactions: Partial<Record<ReactionType, string[]>>;
  comments: Comment[];
  shares: number;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  tags: string[];
  privacy: 'public' | 'friends' | 'private';
  location?: {
    latitude: number;
    longitude: number;
    name: string;
  };
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  likes: string[];
  replies: Comment[];
  createdAt: Date;
  isEdited: boolean;
}

export interface Story {
  id: string;
  userId: string;
  media: string;
  type: 'image' | 'video';
  createdAt: Date;
  expiresAt: Date;
  views: string[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'share';
  targetId: string;
  targetType: 'post' | 'comment' | 'user';
  isRead: boolean;
  createdAt: Date;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio';
  media?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface AppState {
  user: User | null;
  posts: Post[];
  stories: Story[];
  notifications: Notification[];
  chats: Chat[];
  isLoading: boolean;
  error: string | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
} 