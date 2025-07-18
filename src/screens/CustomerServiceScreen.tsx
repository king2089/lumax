import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomerServiceService, { 
  SupportTicket, 
  LiveSupportSession, 
  CustomerServiceAgent 
} from '../services/CustomerServiceService';
import { 
  getResponsiveFontSize, 
  getResponsivePadding, 
  getResponsiveMargin,
  scale,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet
} from '../utils/responsive';

const { width, height } = Dimensions.get('window');

const CustomerServiceScreen: React.FC = () => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const customerService = CustomerServiceService.getInstance();
  
  const [activeTab, setActiveTab] = useState<'tickets' | 'live' | 'agents' | 'analytics'>('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSupportSession[]>([]);
  const [agents, setAgents] = useState<CustomerServiceAgent[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [selectedSession, setSelectedSession] = useState<LiveSupportSession | null>(null);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [showLiveSupport, setShowLiveSupport] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    subject: '',
    description: '',
    category: 'general' as const,
    priority: 'medium' as const
  });
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadData();
    startFadeAnimation();

    // Subscribe to updates
    const listener = (update: any) => {
      if (update.type === 'ticket_created' || update.type === 'message_added') {
        loadTickets();
      } else if (update.type === 'session_created' || update.type === 'session_message_added') {
        loadLiveSessions();
      }
    };

    customerService.addListener(listener);
    return () => customerService.removeListener(listener);
  }, []);

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const loadData = async () => {
    await Promise.all([
      loadTickets(),
      loadLiveSessions(),
      loadAgents(),
      loadAnalytics()
    ]);
  };

  const loadTickets = async () => {
    const userTickets = await customerService.getTickets(user?.id);
    setTickets(userTickets);
  };

  const loadLiveSessions = async () => {
    const userSessions = await customerService.getLiveSessions(user?.id);
    setLiveSessions(userSessions);
  };

  const loadAgents = async () => {
    const allAgents = await customerService.getAgents();
    setAgents(allAgents);
  };

  const loadAnalytics = async () => {
    const analyticsData = await customerService.getSupportAnalytics();
    setAnalytics(analyticsData);
  };

  const handleCreateTicket = async () => {
    if (!newTicketForm.subject.trim() || !newTicketForm.description.trim()) {
      Alert.alert('Missing Information', 'Please fill in both subject and description.');
      return;
    }

    try {
      await customerService.createTicket({
        userId: user?.id || 'current-user',
        ...newTicketForm
      });
      
      setNewTicketForm({ subject: '', description: '', category: 'general', priority: 'medium' });
      setShowCreateTicket(false);
      Alert.alert('Success', 'Support ticket created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create ticket. Please try again.');
    }
  };

  const handleStartLiveSupport = async () => {
    try {
      const availableAgents = await customerService.getAvailableAgents();
      if (availableAgents.length === 0) {
        Alert.alert('No Agents Available', 'All support agents are currently busy. Please try again later or create a ticket.');
        return;
      }

      const session = await customerService.createLiveSession({
        userId: user?.id || 'current-user',
        status: 'waiting',
        sessionType: 'chat',
        quality: '1080p',
        isNSFW: false,
        nsfwLevel: 0,
        ageRestriction: 0,
        contentWarnings: []
      });

      setSelectedSession(session);
      setShowLiveSupport(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to start live support session.');
    }
  };

  const handleSendMessage = async (ticketId: string) => {
    if (!newMessage.trim()) return;

    try {
      await customerService.addMessage(ticketId, {
        ticketId,
        senderId: user?.id || 'current-user',
        senderType: 'user',
        content: newMessage.trim()
      });

      setNewMessage('');
      
      // Get AI response
      setIsTyping(true);
      const aiResponse = await customerService.getAIResponse(newMessage);
      await customerService.addMessage(ticketId, {
        ticketId,
        senderId: 'ai-support',
        senderType: 'ai',
        content: aiResponse
      });
      setIsTyping(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message.');
    }
  };

  const renderTicket = (ticket: SupportTicket) => (
    <TouchableOpacity
      key={ticket.id}
      style={styles.ticketCard}
      onPress={() => setSelectedTicket(ticket)}
    >
      <LinearGradient
        colors={getPriorityColors(ticket.priority)}
        style={styles.ticketGradient}
      >
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketSubject}>{ticket.subject}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
            <Text style={styles.statusText}>{ticket.status.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>
        
        <Text style={styles.ticketDescription} numberOfLines={2}>
          {ticket.description}
        </Text>
        
        <View style={styles.ticketFooter}>
          <Text style={styles.ticketCategory}>{ticket.category.toUpperCase()}</Text>
          <Text style={styles.ticketTime}>
            {new Date(ticket.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderAgent = (agent: CustomerServiceAgent) => (
    <View key={agent.id} style={styles.agentCard}>
      <LinearGradient
        colors={agent.availability.online ? ['#4CAF50', '#45a049'] : ['#9E9E9E', '#757575']}
        style={styles.agentGradient}
      >
        <View style={styles.agentHeader}>
          <View style={styles.agentAvatar}>
            <Text style={styles.agentInitials}>
              {agent.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View style={styles.agentInfo}>
            <Text style={styles.agentName}>{agent.name}</Text>
            <Text style={styles.agentSpecialties}>
              {agent.specialties.slice(0, 2).join(', ')}
            </Text>
          </View>
          <View style={styles.agentStatus}>
            <View style={[styles.statusDot, { backgroundColor: agent.availability.online ? '#4CAF50' : '#9E9E9E' }]} />
            <Text style={styles.statusText}>{agent.availability.status}</Text>
          </View>
        </View>
        
        <View style={styles.agentStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{agent.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{agent.totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{agent.responseTime}s</Text>
            <Text style={styles.statLabel}>Response</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const getPriorityColors = (priority: string) => {
    switch (priority) {
      case 'urgent': return ['#f44336', '#d32f2f'];
      case 'high': return ['#ff9800', '#f57c00'];
      case 'medium': return ['#2196f3', '#1976d2'];
      case 'low': return ['#4caf50', '#388e3c'];
      default: return ['#9e9e9e', '#757575'];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#2196f3';
      case 'in_progress': return '#ff9800';
      case 'resolved': return '#4caf50';
      case 'closed': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
        >
          <View style={styles.headerContent}>
            <Ionicons name="headset" size={40} color="#fff" />
            <Text style={styles.headerTitle}>Gen 1 Customer Service</Text>
            <Text style={styles.headerSubtitle}>AI-Powered Support with Live Video Sessions</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'tickets' && styles.activeTab]}
          onPress={() => setActiveTab('tickets')}
        >
          <Ionicons name="document-text" size={20} color={activeTab === 'tickets' ? '#667eea' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'tickets' && styles.activeTabText]}>Tickets</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'live' && styles.activeTab]}
          onPress={() => setActiveTab('live')}
        >
          <Ionicons name="chatbubbles" size={20} color={activeTab === 'live' ? '#667eea' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'live' && styles.activeTabText]}>Live Support</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'agents' && styles.activeTab]}
          onPress={() => setActiveTab('agents')}
        >
          <Ionicons name="people" size={20} color={activeTab === 'agents' ? '#667eea' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'agents' && styles.activeTabText]}>Agents</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Ionicons name="analytics" size={20} color={activeTab === 'analytics' ? '#667eea' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>Analytics</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'tickets' && (
          <View style={styles.cardSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Support Tickets</Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => setShowCreateTicket(true)}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.createButtonText}>New Ticket</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {tickets.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyStateText}>No support tickets yet</Text>
                  <Text style={styles.emptyStateSubtext}>Create a ticket to get help</Text>
                </View>
              ) : (
                tickets.map(renderTicket)
              )}
            </ScrollView>
          </View>
        )}

        {activeTab === 'live' && (
          <View style={styles.cardSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Live Support</Text>
              <TouchableOpacity 
                style={styles.liveSupportButton}
                onPress={handleStartLiveSupport}
              >
                <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.liveSupportGradient}>
                  <Ionicons name="videocam" size={20} color="#fff" />
                  <Text style={styles.liveSupportText}>Start Live Support</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {liveSessions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyStateText}>No live sessions yet</Text>
                  <Text style={styles.emptyStateSubtext}>Start a live support session</Text>
                </View>
              ) : (
                liveSessions.map(session => (
                  <View key={session.id} style={styles.sessionCard}>
                    <Text style={styles.sessionTitle}>Session #{session.id}</Text>
                    <Text style={styles.sessionStatus}>Status: {session.status}</Text>
                    <Text style={styles.sessionTime}>
                      Started: {new Date(session.startTime).toLocaleString()}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        )}

        {activeTab === 'agents' && (
          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Support Agents</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {agents.map(renderAgent)}
            </ScrollView>
          </View>
        )}

        {activeTab === 'analytics' && analytics && (
          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Support Analytics</Text>
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsValue}>{analytics.totalTickets}</Text>
                <Text style={styles.analyticsLabel}>Total Tickets</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsValue}>{analytics.openTickets}</Text>
                <Text style={styles.analyticsLabel}>Open Tickets</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsValue}>{analytics.resolutionRate.toFixed(1)}%</Text>
                <Text style={styles.analyticsLabel}>Resolution Rate</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsValue}>{analytics.averageResponseTime}s</Text>
                <Text style={styles.analyticsLabel}>Avg Response</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Create Ticket Modal */}
      <Modal
        visible={showCreateTicket}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateTicket(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Support Ticket</Text>
            <TouchableOpacity onPress={handleCreateTicket}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.modalInput}
              placeholder="Subject"
              value={newTicketForm.subject}
              onChangeText={(text) => setNewTicketForm(prev => ({ ...prev, subject: text }))}
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Describe your issue..."
              value={newTicketForm.description}
              onChangeText={(text) => setNewTicketForm(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={6}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Ticket Detail Modal */}
      <Modal
        visible={!!selectedTicket}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedTicket && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedTicket(null)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedTicket.subject}</Text>
              <View style={{ width: 24 }} />
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Text style={styles.ticketDetailDescription}>{selectedTicket.description}</Text>
              
              <View style={styles.messagesContainer}>
                {selectedTicket.messages.map(message => (
                  <View key={message.id} style={[
                    styles.messageBubble,
                    message.senderType === 'user' ? styles.userMessage : styles.agentMessage
                  ]}>
                    <Text style={styles.messageText}>{message.content}</Text>
                    <Text style={styles.messageTime}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                ))}
                {isTyping && (
                  <View style={styles.typingIndicator}>
                    <Text style={styles.typingText}>AI Support is typing...</Text>
                  </View>
                )}
              </View>
            </ScrollView>
            
            <View style={styles.messageInput}>
              <TextInput
                style={styles.inputField}
                placeholder="Type your message..."
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
              />
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={() => handleSendMessage(selectedTicket.id)}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    marginBottom: 0,
  },
  headerGradient: {
    paddingVertical: getResponsivePadding(20),
    paddingHorizontal: getResponsivePadding(20),
    borderBottomLeftRadius: getResponsivePadding(20),
    borderBottomRightRadius: getResponsivePadding(20),
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: getResponsiveFontSize(28),
    fontWeight: 'bold',
    color: '#fff',
    marginTop: getResponsiveMargin(10),
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: getResponsiveFontSize(16),
    color: '#fff',
    opacity: 0.9,
    marginTop: getResponsiveMargin(5),
    textAlign: 'center',
  },
  cardSection: {
    flex: 1,
    marginHorizontal: getResponsivePadding(8),
    marginTop: getResponsivePadding(4),
    marginBottom: getResponsivePadding(4),
    borderRadius: getResponsivePadding(16),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    padding: getResponsivePadding(16),
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: getResponsivePadding(20),
    paddingVertical: getResponsivePadding(10),
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: getResponsivePadding(10),
    borderRadius: getResponsivePadding(10),
  },
  activeTab: {
    backgroundColor: '#f0f4ff',
  },
  tabText: {
    fontSize: getResponsiveFontSize(12),
    color: '#666',
    marginTop: getResponsiveMargin(4),
    fontWeight: '500',
  },
  activeTabText: {
    color: '#667eea',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingBottom: getResponsivePadding(120),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveMargin(16),
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize(20),
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: getResponsivePadding(12),
    paddingVertical: getResponsivePadding(8),
    borderRadius: getResponsivePadding(16),
  },
  createButtonText: {
    color: '#fff',
    fontSize: getResponsiveFontSize(12),
    fontWeight: '600',
    marginLeft: getResponsiveMargin(4),
  },
  liveSupportButton: {
    borderRadius: getResponsivePadding(16),
    overflow: 'hidden',
  },
  liveSupportGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsivePadding(12),
    paddingVertical: getResponsivePadding(8),
  },
  liveSupportText: {
    color: '#fff',
    fontSize: getResponsiveFontSize(12),
    fontWeight: '600',
    marginLeft: getResponsiveMargin(4),
  },
  ticketCard: {
    marginBottom: getResponsiveMargin(12),
    borderRadius: getResponsivePadding(12),
    overflow: 'hidden',
  },
  ticketGradient: {
    padding: getResponsivePadding(16),
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveMargin(8),
  },
  ticketSubject: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: getResponsivePadding(8),
    paddingVertical: getResponsivePadding(4),
    borderRadius: getResponsivePadding(12),
  },
  statusText: {
    fontSize: getResponsiveFontSize(10),
    color: '#fff',
    fontWeight: '600',
  },
  ticketDescription: {
    fontSize: getResponsiveFontSize(14),
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: getResponsiveMargin(8),
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketCategory: {
    fontSize: getResponsiveFontSize(12),
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  ticketTime: {
    fontSize: getResponsiveFontSize(12),
    color: 'rgba(255, 255, 255, 0.8)',
  },
  agentCard: {
    marginBottom: getResponsiveMargin(12),
    borderRadius: getResponsivePadding(12),
    overflow: 'hidden',
  },
  agentGradient: {
    padding: getResponsivePadding(16),
  },
  agentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveMargin(12),
  },
  agentAvatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getResponsiveMargin(12),
  },
  agentInitials: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: 'bold',
    color: '#fff',
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '600',
    color: '#fff',
  },
  agentSpecialties: {
    fontSize: getResponsiveFontSize(12),
    color: 'rgba(255, 255, 255, 0.8)',
  },
  agentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: getResponsiveMargin(4),
  },
  agentStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: getResponsiveFontSize(10),
    color: 'rgba(255, 255, 255, 0.8)',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticsCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: getResponsivePadding(12),
    padding: getResponsivePadding(16),
    marginBottom: getResponsiveMargin(12),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  analyticsValue: {
    fontSize: getResponsiveFontSize(24),
    fontWeight: 'bold',
    color: '#667eea',
  },
  analyticsLabel: {
    fontSize: getResponsiveFontSize(12),
    color: '#666',
    marginTop: getResponsiveMargin(4),
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: getResponsivePadding(40),
  },
  emptyStateText: {
    fontSize: getResponsiveFontSize(16),
    color: '#666',
    marginTop: getResponsiveMargin(12),
  },
  emptyStateSubtext: {
    fontSize: getResponsiveFontSize(14),
    color: '#999',
    marginTop: getResponsiveMargin(4),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsivePadding(16),
    paddingVertical: getResponsivePadding(16),
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: getResponsiveFontSize(18),
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalSaveText: {
    fontSize: getResponsiveFontSize(16),
    color: '#667eea',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: getResponsivePadding(16),
  },
  modalInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: getResponsivePadding(8),
    paddingHorizontal: getResponsivePadding(12),
    paddingVertical: getResponsivePadding(12),
    fontSize: getResponsiveFontSize(16),
    marginBottom: getResponsiveMargin(12),
  },
  modalTextArea: {
    height: getResponsivePadding(120),
    textAlignVertical: 'top',
  },
  ticketDetailDescription: {
    fontSize: getResponsiveFontSize(16),
    color: '#1a1a1a',
    marginBottom: getResponsiveMargin(16),
    lineHeight: getResponsiveFontSize(24),
  },
  messagesContainer: {
    marginBottom: getResponsiveMargin(16),
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: getResponsivePadding(12),
    paddingVertical: getResponsivePadding(8),
    borderRadius: getResponsivePadding(12),
    marginBottom: getResponsiveMargin(8),
  },
  userMessage: {
    backgroundColor: '#667eea',
    alignSelf: 'flex-end',
  },
  agentMessage: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: getResponsiveFontSize(14),
    color: '#1a1a1a',
  },
  messageTime: {
    fontSize: getResponsiveFontSize(10),
    color: '#666',
    marginTop: getResponsiveMargin(4),
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsivePadding(12),
    paddingVertical: getResponsivePadding(8),
  },
  typingText: {
    fontSize: getResponsiveFontSize(12),
    color: '#666',
    fontStyle: 'italic',
  },
  messageInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: getResponsivePadding(16),
    paddingVertical: getResponsivePadding(12),
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  inputField: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: getResponsivePadding(20),
    paddingHorizontal: getResponsivePadding(12),
    paddingVertical: getResponsivePadding(8),
    maxHeight: getResponsivePadding(100),
    marginRight: getResponsiveMargin(8),
  },
  sendButton: {
    backgroundColor: '#667eea',
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: getResponsivePadding(12),
    padding: getResponsivePadding(16),
    marginBottom: getResponsiveMargin(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sessionTitle: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: getResponsiveMargin(4),
  },
  sessionStatus: {
    fontSize: getResponsiveFontSize(14),
    color: '#666',
    marginBottom: getResponsiveMargin(4),
  },
  sessionTime: {
    fontSize: getResponsiveFontSize(12),
    color: '#999',
  },
});

export default CustomerServiceScreen; 