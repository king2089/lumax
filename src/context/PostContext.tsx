import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export interface ProfilePost {
  id: string;
  userId: string;
  content: string;
  images?: string[];
  videoUrl?: string;
  audioUrl?: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'story' | 'memory' | 'achievement';
  reactions: { [key: string]: string[] }; // reaction type -> user IDs
  comments: PostComment[];
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
  mood?: string;
  music?: {
    trackId: string;
    title: string;
    artist: string;
  };
  isStory: boolean;
  storyExpiresAt?: Date;
  isPinned: boolean;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  reactions: { [key: string]: string[] };
  replies: PostComment[];
  createdAt: Date;
  isEdited: boolean;
}

export interface PostDraft {
  id: string;
  userId: string;
  content: string;
  images: string[];
  type: 'text' | 'image' | 'video' | 'audio';
  privacy: 'public' | 'friends' | 'private';
  tags: string[];
  createdAt: Date;
  mood?: string;
  location?: {
    latitude: number;
    longitude: number;
    name: string;
  };
}

interface PostContextType {
  // Posts
  profilePosts: ProfilePost[];
  feedPosts: ProfilePost[];
  drafts: PostDraft[];
  
  // Post Management
  createPost: (post: Partial<ProfilePost>) => Promise<void>;
  updatePost: (postId: string, updates: Partial<ProfilePost>) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  pinPost: (postId: string) => Promise<void>;
  unpinPost: (postId: string) => Promise<void>;
  
  // Feed Management
  refreshFeed: () => Promise<void>;
  getUserPosts: (userId: string) => ProfilePost[];
  getPublicPosts: () => ProfilePost[];
  
  // Reactions & Comments
  addReaction: (postId: string, reactionType: string) => Promise<void>;
  removeReaction: (postId: string, reactionType: string) => Promise<void>;
  addComment: (postId: string, content: string, parentCommentId?: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  
  // Stories
  createStory: (content: Partial<ProfilePost>) => Promise<void>;
  getActiveStories: (userId?: string) => ProfilePost[];
  
  // Drafts
  saveDraft: (draft: Partial<PostDraft>) => Promise<void>;
  deleteDraft: (draftId: string) => Promise<void>;
  publishDraft: (draftId: string) => Promise<void>;
  
  // Analytics
  getPostStats: (postId: string) => {
    views: number;
    reactions: number;
    comments: number;
    shares: number;
    reach: number;
  };
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const usePost = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePost must be used within a PostProvider');
  }
  return context;
};

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profilePosts, setProfilePosts] = useState<ProfilePost[]>([]);
  const [feedPosts, setFeedPosts] = useState<ProfilePost[]>([]);
  const [drafts, setDrafts] = useState<PostDraft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadStoredData();
    initializeSampleData();
  }, [user]);

  const loadStoredData = async () => {
    try {
      const storedPosts = await AsyncStorage.getItem('@luma_posts');
      const storedDrafts = await AsyncStorage.getItem('@luma_drafts');
      
      if (storedPosts) {
        const posts = JSON.parse(storedPosts).map((post: any) => ({
          ...post,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt),
          storyExpiresAt: post.storyExpiresAt ? new Date(post.storyExpiresAt) : undefined,
        }));
        
        const userPosts = posts.filter((post: ProfilePost) => post.userId === user?.id);
        const publicPosts = posts.filter((post: ProfilePost) => post.privacy === 'public');
        
        setProfilePosts(userPosts);
        setFeedPosts(publicPosts);
      }
      
      if (storedDrafts) {
        const parsedDrafts = JSON.parse(storedDrafts).map((draft: any) => ({
          ...draft,
          createdAt: new Date(draft.createdAt),
        }));
        setDrafts(parsedDrafts.filter((draft: PostDraft) => draft.userId === user?.id));
      }
    } catch (error) {
      console.error('Error loading stored post data:', error);
    }
  };

  const savePostsToStorage = async (posts: ProfilePost[]) => {
    try {
      await AsyncStorage.setItem('@luma_posts', JSON.stringify(posts));
    } catch (error) {
      console.error('Error saving posts:', error);
    }
  };

  const saveDraftsToStorage = async (drafts: PostDraft[]) => {
    try {
      await AsyncStorage.setItem('@luma_drafts', JSON.stringify(drafts));
    } catch (error) {
      console.error('Error saving drafts:', error);
    }
  };

  const initializeSampleData = async () => {
    if (!user || profilePosts.length > 0) return;

    const samplePosts: ProfilePost[] = [
      {
        id: '1',
        userId: user.id,
        content: '🎉 Just joined Luma Go! Excited to connect with amazing people and share my journey. #LumaGo #NewBeginnings',
        type: 'text',
        reactions: { like: ['user1', 'user2'], love: ['user3'] },
        comments: [
          {
            id: 'c1',
            postId: '1',
            userId: 'user1',
            content: 'Welcome to Luma Go! 🎉 This is going to be amazing!',
            reactions: { like: [user.id, 'user2'] },
            replies: [
              {
                id: 'r1',
                postId: '1',
                userId: user.id,
                content: 'Thanks! I\'m so excited to be here! 🚀',
                reactions: { like: ['user1'] },
                replies: [],
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23),
                isEdited: false,
              }
            ],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
            isEdited: false,
          },
          {
            id: 'c2',
            postId: '1',
            userId: 'user3',
            content: 'Can\'t wait to see what you\'ll share! ✨',
            reactions: { like: [user.id] },
            replies: [],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
            isEdited: false,
          }
        ],
        shares: 2,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        isEdited: false,
        tags: ['LumaGo', 'NewBeginnings'],
        privacy: 'public',
        isStory: false,
        isPinned: true,
      },
      {
        id: '2',
        userId: user.id,
        content: 'Beautiful sunset today! 🌅 Sometimes you just need to stop and appreciate the little moments.',
        images: ['https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Sunset+View'],
        type: 'image',
        reactions: { like: ['user1', 'user4'], wow: ['user2'] },
        comments: [
          {
            id: 'c1',
            postId: '2',
            userId: 'user1',
            content: 'Gorgeous shot! 📸 Where was this taken?',
            reactions: { like: [user.id] },
            replies: [
              {
                id: 'r1',
                postId: '2',
                userId: user.id,
                content: 'Thanks! This was at Golden Gate Park in San Francisco 🌉',
                reactions: { like: ['user1'] },
                replies: [],
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10),
                isEdited: false,
              }
            ],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
            isEdited: false,
          },
          {
            id: 'c2',
            postId: '2',
            userId: 'user2',
            content: 'Absolutely stunning! The colors are perfect 🌅',
            reactions: { like: [user.id, 'user1'] },
            replies: [],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
            isEdited: false,
          },
          {
            id: 'c3',
            postId: '2',
            userId: 'user3',
            content: 'This makes me want to visit SF! Beautiful capture ✨',
            reactions: { like: [user.id] },
            replies: [],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
            isEdited: false,
          }
        ],
        shares: 1,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18 hours ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
        isEdited: false,
        tags: ['sunset', 'nature', 'photography'],
        privacy: 'public',
        mood: 'peaceful',
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          name: 'San Francisco, CA'
        },
        isStory: false,
        isPinned: false,
      },
      {
        id: '3',
        userId: user.id,
        content: '💪 Completed my first marathon! 26.2 miles of pure determination. Thanks to everyone who supported me! #Marathon #Achievement',
        images: ['https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Marathon+Finish'],
        type: 'achievement',
        reactions: { like: ['user1', 'user2', 'user3'], love: ['user4'], wow: ['user5'] },
        comments: [
          {
            id: 'c4',
            postId: '3',
            userId: 'user1',
            content: 'Congratulations! 🎉 That\'s an incredible achievement!',
            reactions: { like: [user.id, 'user2'] },
            replies: [],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
            isEdited: false,
          },
          {
            id: 'c5',
            postId: '3',
            userId: 'user4',
            content: 'You\'re an inspiration! How long did you train for this?',
            reactions: { like: [user.id] },
            replies: [
              {
                id: 'r2',
                postId: '3',
                userId: user.id,
                content: 'Thank you! I trained for about 6 months. It was tough but totally worth it! 💪',
                reactions: { like: ['user4', 'user1'] },
                replies: [],
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
                isEdited: false,
              }
            ],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
            isEdited: false,
          }
        ],
        shares: 5,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        isEdited: false,
        tags: ['Marathon', 'Achievement', 'Running', 'Fitness'],
        privacy: 'public',
        mood: 'accomplished',
        isStory: false,
        isPinned: false,
      }
    ];

    setProfilePosts(samplePosts);
    
    // Add to feed for public posts
    const publicPosts = samplePosts.filter(post => post.privacy === 'public');
    setFeedPosts(prev => [...prev, ...publicPosts]);
    
    await savePostsToStorage([...feedPosts, ...samplePosts]);
  };

  const createPost = async (postData: Partial<ProfilePost>) => {
    if (!user) return;

    const newPost: ProfilePost = {
      id: Date.now().toString(),
      userId: user.id,
      content: postData.content || '',
      images: postData.images || [],
      videoUrl: postData.videoUrl,
      audioUrl: postData.audioUrl,
      type: postData.type || 'text',
      reactions: {},
      comments: [],
      shares: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isEdited: false,
      tags: postData.tags || [],
      privacy: postData.privacy || 'public',
      location: postData.location,
      mood: postData.mood,
      music: postData.music,
      isStory: postData.isStory || false,
      storyExpiresAt: postData.isStory ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined,
      isPinned: false,
    };

    setProfilePosts(prev => [newPost, ...prev]);
    
    if (newPost.privacy === 'public') {
      setFeedPosts(prev => [newPost, ...prev]);
    }

    await savePostsToStorage([...feedPosts, newPost]);
  };

  const updatePost = async (postId: string, updates: Partial<ProfilePost>) => {
    const updatePostInArray = (posts: ProfilePost[]) =>
      posts.map(post => 
        post.id === postId 
          ? { ...post, ...updates, updatedAt: new Date(), isEdited: true }
          : post
      );

    setProfilePosts(updatePostInArray);
    setFeedPosts(updatePostInArray);

    const allPosts = [...profilePosts, ...feedPosts].filter((post, index, self) => 
      index === self.findIndex(p => p.id === post.id)
    );
    await savePostsToStorage(allPosts);
  };

  const deletePost = async (postId: string) => {
    setProfilePosts(prev => prev.filter(post => post.id !== postId));
    setFeedPosts(prev => prev.filter(post => post.id !== postId));

    const allPosts = [...profilePosts, ...feedPosts].filter(post => post.id !== postId);
    await savePostsToStorage(allPosts);
  };

  const pinPost = async (postId: string) => {
    await updatePost(postId, { isPinned: true });
  };

  const unpinPost = async (postId: string) => {
    await updatePost(postId, { isPinned: false });
  };

  const addReaction = async (postId: string, reactionType: string) => {
    if (!user) return;

    const updateReactions = (posts: ProfilePost[]) =>
      posts.map(post => {
        if (post.id === postId) {
          const reactions = { ...post.reactions };
          if (!reactions[reactionType]) {
            reactions[reactionType] = [];
          }
          if (!reactions[reactionType].includes(user.id)) {
            reactions[reactionType].push(user.id);
          }
          return { ...post, reactions };
        }
        return post;
      });

    setProfilePosts(updateReactions);
    setFeedPosts(updateReactions);
  };

  const removeReaction = async (postId: string, reactionType: string) => {
    if (!user) return;

    const updateReactions = (posts: ProfilePost[]) =>
      posts.map(post => {
        if (post.id === postId) {
          const reactions = { ...post.reactions };
          if (reactions[reactionType]) {
            reactions[reactionType] = reactions[reactionType].filter(id => id !== user.id);
          }
          return { ...post, reactions };
        }
        return post;
      });

    setProfilePosts(updateReactions);
    setFeedPosts(updateReactions);
  };

  const addComment = async (postId: string, content: string, parentCommentId?: string) => {
    if (!user) return;

    const newComment: PostComment = {
      id: Date.now().toString(),
      postId,
      userId: user.id,
      content,
      reactions: {},
      replies: [],
      createdAt: new Date(),
      isEdited: false,
    };

    const updateComments = (posts: ProfilePost[]) =>
      posts.map(post => {
        if (post.id === postId) {
          const comments = [...post.comments];
          if (parentCommentId) {
            // Add as reply
            const parentIndex = comments.findIndex(c => c.id === parentCommentId);
            if (parentIndex !== -1) {
              comments[parentIndex].replies.push(newComment);
            }
          } else {
            // Add as main comment
            comments.push(newComment);
          }
          return { ...post, comments };
        }
        return post;
      });

    setProfilePosts(updateComments);
    setFeedPosts(updateComments);
  };

  const deleteComment = async (commentId: string) => {
    const removeComment = (posts: ProfilePost[]) =>
      posts.map(post => ({
        ...post,
        comments: post.comments
          .filter(comment => comment.id !== commentId)
          .map(comment => ({
            ...comment,
            replies: comment.replies.filter(reply => reply.id !== commentId)
          }))
      }));

    setProfilePosts(removeComment);
    setFeedPosts(removeComment);
  };

  const createStory = async (content: Partial<ProfilePost>) => {
    await createPost({
      ...content,
      isStory: true,
      privacy: 'public',
    });
  };

  const getActiveStories = (userId?: string) => {
    const now = new Date();
    return feedPosts.filter(post => 
      post.isStory && 
      post.storyExpiresAt && 
      post.storyExpiresAt > now &&
      (userId ? post.userId === userId : true)
    );
  };

  const saveDraft = async (draftData: Partial<PostDraft>) => {
    if (!user) return;

    const newDraft: PostDraft = {
      id: Date.now().toString(),
      userId: user.id,
      content: draftData.content || '',
      images: draftData.images || [],
      type: draftData.type || 'text',
      privacy: draftData.privacy || 'public',
      tags: draftData.tags || [],
      createdAt: new Date(),
      mood: draftData.mood,
      location: draftData.location,
    };

    setDrafts(prev => [newDraft, ...prev]);
    await saveDraftsToStorage([newDraft, ...drafts]);
  };

  const deleteDraft = async (draftId: string) => {
    const updatedDrafts = drafts.filter(draft => draft.id !== draftId);
    setDrafts(updatedDrafts);
    await saveDraftsToStorage(updatedDrafts);
  };

  const publishDraft = async (draftId: string) => {
    const draft = drafts.find(d => d.id === draftId);
    if (draft) {
      await createPost({
        content: draft.content,
        images: draft.images,
        type: draft.type,
        privacy: draft.privacy,
        tags: draft.tags,
        mood: draft.mood,
        location: draft.location,
      });
      await deleteDraft(draftId);
    }
  };

  const refreshFeed = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    await loadStoredData();
    setIsRefreshing(false);
  };

  const getUserPosts = (userId: string) => {
    return feedPosts.filter(post => post.userId === userId);
  };

  const getPublicPosts = () => {
    return feedPosts.filter(post => post.privacy === 'public');
  };

  const getPostStats = (postId: string) => {
    const post = [...profilePosts, ...feedPosts].find(p => p.id === postId);
    if (!post) {
      return { views: 0, reactions: 0, comments: 0, shares: 0, reach: 0 };
    }

    const reactions = Object.values(post.reactions).reduce((sum, users) => sum + users.length, 0);
    const comments = post.comments.length + post.comments.reduce((sum, comment) => sum + comment.replies.length, 0);
    
    return {
      views: reactions * 10 + comments * 15 + post.shares * 5, // Estimated views
      reactions,
      comments,
      shares: post.shares,
      reach: reactions * 8 + post.shares * 20, // Estimated reach
    };
  };

  return (
    <PostContext.Provider value={{
      profilePosts,
      feedPosts,
      drafts,
      createPost,
      updatePost,
      deletePost,
      pinPost,
      unpinPost,
      refreshFeed,
      getUserPosts,
      getPublicPosts,
      addReaction,
      removeReaction,
      addComment,
      deleteComment,
      createStory,
      getActiveStories,
      saveDraft,
      deleteDraft,
      publishDraft,
      getPostStats,
      isLoading,
      isRefreshing,
    }}>
      {children}
    </PostContext.Provider>
  );
}; 