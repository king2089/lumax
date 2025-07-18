import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'feature' | 'bug' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  messages: SupportMessage[];
  attachments?: string[];
  tags: string[];
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'user' | 'agent' | 'ai';
  content: string;
  timestamp: Date;
  isInternal?: boolean;
  attachments?: string[];
}

export interface LiveSupportSession {
  id: string;
  userId: string;
  agentId?: string;
  status: 'waiting' | 'active' | 'ended';
  startTime: Date;
  endTime?: Date;
  messages: SupportMessage[];
  sessionType: 'chat' | 'video' | 'screen_share';
  quality: '1080p' | '4K' | '8K' | '20K';
  isNSFW: boolean;
  nsfwLevel: number;
  ageRestriction: number;
  contentWarnings: string[];
}

export interface CustomerServiceAgent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  specialties: string[];
  languages: string[];
  availability: {
    online: boolean;
    status: 'available' | 'busy' | 'away' | 'offline';
    currentSessions: number;
    maxSessions: number;
  };
  rating: number;
  totalSessions: number;
  responseTime: number; // average response time in seconds
}

class CustomerServiceService {
  private static instance: CustomerServiceService;
  private tickets: SupportTicket[] = [];
  private liveSessions: LiveSupportSession[] = [];
  private agents: CustomerServiceAgent[] = [];
  private listeners: ((update: any) => void)[] = [];

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): CustomerServiceService {
    if (!CustomerServiceService.instance) {
      CustomerServiceService.instance = new CustomerServiceService();
    }
    return CustomerServiceService.instance;
  }

  private initializeMockData() {
    // Mock agents
    this.agents = [
      {
        id: 'agent-1',
        name: 'Sarah Chen',
        email: 'sarah@luma-ai.com',
        avatar: 'https://i.pravatar.cc/150?u=sarah',
        specialties: ['Technical Support', 'AI Features', 'Live Streaming'],
        languages: ['English', 'Mandarin'],
        availability: {
          online: true,
          status: 'available',
          currentSessions: 2,
          maxSessions: 5
        },
        rating: 4.8,
        totalSessions: 1247,
        responseTime: 45
      },
      {
        id: 'agent-2',
        name: 'Marcus Johnson',
        email: 'marcus@luma-ai.com',
        avatar: 'https://i.pravatar.cc/150?u=marcus',
        specialties: ['Billing', 'Account Management', 'NSFW Content'],
        languages: ['English', 'Spanish'],
        availability: {
          online: true,
          status: 'available',
          currentSessions: 1,
          maxSessions: 4
        },
        rating: 4.9,
        totalSessions: 892,
        responseTime: 32
      },
      {
        id: 'agent-3',
        name: 'Priya Patel',
        email: 'priya@luma-ai.com',
        avatar: 'https://i.pravatar.cc/150?u=priya',
        specialties: ['Feature Requests', 'Bug Reports', 'User Experience'],
        languages: ['English', 'Hindi'],
        availability: {
          online: false,
          status: 'offline',
          currentSessions: 0,
          maxSessions: 3
        },
        rating: 4.7,
        totalSessions: 567,
        responseTime: 58
      }
    ];

    // Mock tickets
    this.tickets = [
      {
        id: 'ticket-1',
        userId: 'user-1',
        subject: 'Live Streaming Quality Issues',
        description: 'My 4K stream keeps dropping to 1080p automatically. How can I maintain 4K quality?',
        category: 'technical',
        priority: 'medium',
        status: 'open',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(),
        messages: [
          {
            id: 'msg-1',
            ticketId: 'ticket-1',
            senderId: 'user-1',
            senderType: 'user',
            content: 'My 4K stream keeps dropping to 1080p automatically. How can I maintain 4K quality?',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: 'msg-2',
            ticketId: 'ticket-1',
            senderId: 'ai-support',
            senderType: 'ai',
            content: 'Hello! I can help you with your live streaming quality issues. This is typically caused by network bandwidth limitations. Let me connect you with a live streaming specialist.',
            timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000)
          }
        ],
        tags: ['live-streaming', 'quality', '4K']
      },
      {
        id: 'ticket-2',
        userId: 'user-2',
        subject: 'NSFW Content Settings',
        description: 'I want to enable NSFW content but the age verification isn\'t working properly.',
        category: 'feature',
        priority: 'high',
        status: 'in_progress',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        updatedAt: new Date(),
        assignedTo: 'agent-2',
        messages: [
          {
            id: 'msg-3',
            ticketId: 'ticket-2',
            senderId: 'user-2',
            senderType: 'user',
            content: 'I want to enable NSFW content but the age verification isn\'t working properly.',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
          },
          {
            id: 'msg-4',
            ticketId: 'ticket-2',
            senderId: 'agent-2',
            senderType: 'agent',
            content: 'Hi there! I can help you with the age verification for NSFW content. Can you tell me what specific error you\'re seeing?',
            timestamp: new Date(Date.now() - 30 * 60 * 1000)
          }
        ],
        tags: ['nsfw', 'age-verification', 'settings']
      }
    ];
  }

  // Ticket Management
  public async createTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages'>): Promise<SupportTicket> {
    const newTicket: SupportTicket = {
      ...ticket,
      id: `ticket-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: []
    };

    this.tickets.push(newTicket);
    this.notifyListeners({ type: 'ticket_created', ticket: newTicket });
    return newTicket;
  }

  public async getTickets(userId?: string): Promise<SupportTicket[]> {
    if (userId) {
      return this.tickets.filter(ticket => ticket.userId === userId);
    }
    return this.tickets;
  }

  public async getTicket(ticketId: string): Promise<SupportTicket | null> {
    return this.tickets.find(ticket => ticket.id === ticketId) || null;
  }

  public async addMessage(ticketId: string, message: Omit<SupportMessage, 'id' | 'timestamp'>): Promise<SupportMessage> {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const newMessage: SupportMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date()
    };

    ticket.messages.push(newMessage);
    ticket.updatedAt = new Date();
    
    this.notifyListeners({ type: 'message_added', ticketId, message: newMessage });
    return newMessage;
  }

  // Live Support Sessions
  public async createLiveSession(session: Omit<LiveSupportSession, 'id' | 'startTime' | 'messages'>): Promise<LiveSupportSession> {
    const newSession: LiveSupportSession = {
      ...session,
      id: `session-${Date.now()}`,
      startTime: new Date(),
      messages: []
    };

    this.liveSessions.push(newSession);
    this.notifyListeners({ type: 'session_created', session: newSession });
    return newSession;
  }

  public async getLiveSessions(userId?: string): Promise<LiveSupportSession[]> {
    if (userId) {
      return this.liveSessions.filter(session => session.userId === userId);
    }
    return this.liveSessions;
  }

  public async getLiveSession(sessionId: string): Promise<LiveSupportSession | null> {
    return this.liveSessions.find(session => session.id === sessionId) || null;
  }

  public async addSessionMessage(sessionId: string, message: Omit<SupportMessage, 'id' | 'timestamp'>): Promise<SupportMessage> {
    const session = this.liveSessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const newMessage: SupportMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date()
    };

    session.messages.push(newMessage);
    this.notifyListeners({ type: 'session_message_added', sessionId, message: newMessage });
    return newMessage;
  }

  public async endLiveSession(sessionId: string): Promise<void> {
    const session = this.liveSessions.find(s => s.id === sessionId);
    if (session) {
      session.status = 'ended';
      session.endTime = new Date();
      this.notifyListeners({ type: 'session_ended', sessionId });
    }
  }

  // Agent Management
  public async getAgents(): Promise<CustomerServiceAgent[]> {
    return this.agents;
  }

  public async getAvailableAgents(): Promise<CustomerServiceAgent[]> {
    return this.agents.filter(agent => 
      agent.availability.online && 
      agent.availability.status === 'available' &&
      agent.availability.currentSessions < agent.availability.maxSessions
    );
  }

  public async assignAgentToTicket(ticketId: string, agentId: string): Promise<void> {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.assignedTo = agentId;
      ticket.status = 'in_progress';
      ticket.updatedAt = new Date();
      this.notifyListeners({ type: 'agent_assigned', ticketId, agentId });
    }
  }

  // AI-Powered Support
  public async getAIResponse(userMessage: string, context?: any): Promise<string> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('live stream') || lowerMessage.includes('streaming')) {
      return "I can help you with live streaming issues! For quality problems, try checking your internet connection and device settings. Would you like me to connect you with a live streaming specialist?";
    }
    
    if (lowerMessage.includes('nsfw') || lowerMessage.includes('age')) {
      return "For NSFW content and age verification issues, I can help you with the settings. Make sure you're 18+ and have proper ID verification. Would you like to speak with our NSFW content specialist?";
    }
    
    if (lowerMessage.includes('billing') || lowerMessage.includes('payment')) {
      return "I can assist with billing and payment questions. Please provide your account details and I'll connect you with our billing specialist.";
    }
    
    if (lowerMessage.includes('bug') || lowerMessage.includes('error')) {
      return "I'm sorry to hear you're experiencing issues. Let me gather some information about the bug and connect you with our technical support team.";
    }
    
    return "Thank you for contacting Luma AI support! I'm here to help you with any questions about our AI features, live streaming, or app functionality. How can I assist you today?";
  }

  // Analytics and Reporting
  public async getSupportAnalytics(): Promise<any> {
    const totalTickets = this.tickets.length;
    const openTickets = this.tickets.filter(t => t.status === 'open').length;
    const resolvedTickets = this.tickets.filter(t => t.status === 'resolved').length;
    const averageResponseTime = this.agents.reduce((sum, agent) => sum + agent.responseTime, 0) / this.agents.length;

    return {
      totalTickets,
      openTickets,
      resolvedTickets,
      resolutionRate: (resolvedTickets / totalTickets) * 100,
      averageResponseTime,
      activeSessions: this.liveSessions.filter(s => s.status === 'active').length,
      availableAgents: this.agents.filter(a => a.availability.status === 'available').length
    };
  }

  // Event Listeners
  public addListener(listener: (update: any) => void) {
    this.listeners.push(listener);
  }

  public removeListener(listener: (update: any) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(update: any) {
    this.listeners.forEach(listener => {
      try {
        listener(update);
      } catch (error) {
        console.error('Error in customer service listener:', error);
      }
    });
  }

  // Utility Methods
  public async saveToStorage() {
    try {
      await AsyncStorage.setItem('customerServiceData', JSON.stringify({
        tickets: this.tickets,
        liveSessions: this.liveSessions,
        agents: this.agents
      }));
    } catch (error) {
      console.error('Error saving customer service data:', error);
    }
  }

  public async loadFromStorage() {
    try {
      const data = await AsyncStorage.getItem('customerServiceData');
      if (data) {
        const parsed = JSON.parse(data);
        this.tickets = parsed.tickets || [];
        this.liveSessions = parsed.liveSessions || [];
        this.agents = parsed.agents || [];
      }
    } catch (error) {
      console.error('Error loading customer service data:', error);
    }
  }
}

export default CustomerServiceService; 