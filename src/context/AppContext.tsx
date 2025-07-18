import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { AppState, Post, Story, Notification, Chat, User, Comment, ReactionType } from '../types';
import { useAuth } from './AuthContext';

interface AppContextType extends AppState {
  // Post Actions
  addPost: (post: Post) => void;
  setPosts: (posts: Post[]) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  deletePost: (postId: string) => void;
  
  // Reaction Actions
  likePost: (postId: string) => void;
  addReaction: (postId: string, reaction: ReactionType) => void;
  removeReaction: (postId: string) => void;
  
  // Comment Actions
  addComment: (postId: string, comment: Comment) => void;
  
  // Story Actions
  addStory: (story: Story) => void;
  removeStory: (storyId: string) => void;

  // Notification Actions
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;

  // Chat Actions
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  
  // User/App State Actions
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

type AppAction =
  | { type: 'ADD_POST'; payload: Post }
  | { type: 'SET_POSTS'; payload: Post[] }
  | { type: 'UPDATE_POST'; payload: { postId: string; updates: Partial<Post> } }
  | { type: 'DELETE_POST'; payload: string }
  | { type: 'ADD_REACTION'; payload: { postId: string; reaction: ReactionType; userId: string } }
  | { type: 'REMOVE_REACTION'; payload: { postId: string; userId: string } }
  | { type: 'ADD_COMMENT'; payload: { postId: string; comment: Comment } }
  | { type: 'ADD_STORY'; payload: Story }
  | { type: 'REMOVE_STORY'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'ADD_CHAT'; payload: Chat }
  | { type: 'UPDATE_CHAT'; payload: { chatId: string; updates: Partial<Chat> } }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_POST':
      return {
        ...state,
        posts: [action.payload, ...state.posts],
      };
    case 'SET_POSTS':
      return {
        ...state,
        posts: action.payload,
      };
    case 'UPDATE_POST':
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload.postId
            ? { ...post, ...action.payload.updates }
            : post
        ),
      };
    case 'DELETE_POST':
      return {
        ...state,
        posts: state.posts.filter(post => post.id !== action.payload),
      };
    case 'ADD_REACTION':
        return {
          ...state,
          posts: state.posts.map(post => {
            if (post.id === action.payload.postId) {
              const newReactions = { ...(post.reactions || {}) };
              const { userId, reaction } = action.payload;
              
              const existingReaction = Object.keys(newReactions).find(r => newReactions[r as ReactionType]?.includes(userId));

              // Remove user from any existing reaction
              if(existingReaction) {
                const reactionType = existingReaction as ReactionType;
                newReactions[reactionType] = newReactions[reactionType]?.filter(id => id !== userId);
                if (newReactions[reactionType]?.length === 0) delete newReactions[reactionType];
              }

              // if the new reaction is the same as the old one, we just removed it (aka toggle)
              // so we don't add it back
              if (existingReaction !== reaction) {
                if (!newReactions[reaction]) {
                    newReactions[reaction] = [];
                }
                newReactions[reaction]?.push(userId);
              }

              return { ...post, reactions: newReactions };
            }
            return post;
          }),
        };
    case 'REMOVE_REACTION':
        return {
            ...state,
            posts: state.posts.map(post => {
                if (post.id === action.payload.postId) {
                    const newReactions = { ...(post.reactions || {}) };
                    const { userId } = action.payload;
                    
                    for (const r in newReactions) {
                        const reactionType = r as ReactionType;
                        newReactions[reactionType] = newReactions[reactionType]?.filter(id => id !== userId);
                        if (newReactions[reactionType]?.length === 0) delete newReactions[reactionType];
                    }
                    return { ...post, reactions: newReactions };
                }
                return post;
            }),
        };
    case 'ADD_COMMENT':
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload.postId
            ? { ...post, comments: [...post.comments, action.payload.comment] }
            : post
        ),
      };
    case 'ADD_STORY':
      return {
        ...state,
        stories: [action.payload, ...state.stories],
      };
    case 'REMOVE_STORY':
      return {
        ...state,
        stories: state.stories.filter(story => story.id !== action.payload),
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, isRead: true }
            : notification
        ),
      };
    case 'ADD_CHAT':
      return {
        ...state,
        chats: [action.payload, ...state.chats],
      };
    case 'UPDATE_CHAT':
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat.id === action.payload.chatId
            ? { ...chat, ...action.payload.updates }
            : chat
        ),
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
};

const initialState: AppState = {
  user: null,
  posts: [],
  stories: [],
  notifications: [],
  chats: [],
  isLoading: false,
  error: null,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();

  const addPost = (post: Post) => {
    dispatch({ type: 'ADD_POST', payload: post });
  };

  const setPosts = (posts: Post[]) => {
    dispatch({ type: 'SET_POSTS', payload: posts });
  };

  const updatePost = (postId: string, updates: Partial<Post>) => {
    dispatch({ type: 'UPDATE_POST', payload: { postId, updates } });
  };

  const deletePost = (postId: string) => {
    dispatch({ type: 'DELETE_POST', payload: postId });
  };

  const likePost = (postId: string) => {
    addReaction(postId, 'like');
  };

  const addReaction = (postId: string, reaction: ReactionType) => {
    if (user?.id) dispatch({ type: 'ADD_REACTION', payload: { postId, reaction, userId: user.id } });
  };

  const removeReaction = (postId: string) => {
    if (user?.id) dispatch({ type: 'REMOVE_REACTION', payload: { postId, userId: user.id } });
  };

  const addComment = (postId: string, comment: Comment) => {
    dispatch({ type: 'ADD_COMMENT', payload: { postId, comment } });
  };

  const addStory = (story: Story) => {
    dispatch({ type: 'ADD_STORY', payload: story });
  };

  const removeStory = (storyId: string) => {
    dispatch({ type: 'REMOVE_STORY', payload: storyId });
  };

  const addNotification = (notification: Notification) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const markNotificationAsRead = (notificationId: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });
  };

  const addChat = (chat: Chat) => {
    dispatch({ type: 'ADD_CHAT', payload: chat });
  };

  const updateChat = (chatId: string, updates: Partial<Chat>) => {
    dispatch({ type: 'UPDATE_CHAT', payload: { chatId, updates } });
  };

  const setUser = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const value: AppContextType = {
    ...state,
    // Post Actions
    addPost,
    setPosts,
    updatePost,
    deletePost,
    // Reaction Actions
    likePost,
    addReaction,
    removeReaction,
    // Comment Actions
    addComment,
    // Story Actions
    addStory,
    removeStory,
    // Notification Actions
    addNotification,
    markNotificationAsRead,
    // Chat Actions
    addChat,
    updateChat,
    // User/App State Actions
    setUser,
    setLoading,
    setError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    console.error('useApp must be used within an AppProvider');
    // Return a fallback context to prevent crashes
    return {
      user: null,
      posts: [],
      stories: [],
      notifications: [],
      chats: [],
      isLoading: false,
      error: null,
      addPost: () => {},
      setPosts: () => {},
      updatePost: () => {},
      deletePost: () => {},
      likePost: () => {},
      addReaction: () => {},
      removeReaction: () => {},
      addComment: () => {},
      addStory: () => {},
      removeStory: () => {},
      addNotification: () => {},
      markNotificationAsRead: () => {},
      addChat: () => {},
      updateChat: () => {},
      setUser: () => {},
      setLoading: () => {},
      setError: () => {},
    };
  }
  return context;
}; 