import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  Animated,
  FlatList,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useLovedOnes, LovedOne, ChatMessage } from '../context/LovedOnesContext';

const { width, height } = Dimensions.get('window');

interface LumaLovedOnesScreenProps {
  onClose: () => void;
}

export const LumaLovedOnesScreen: React.FC<LumaLovedOnesScreenProps> = ({ onClose }) => {
  const {
    lovedOnes,
    activeLovedOne,
    setActiveLovedOne,
    sendMessage,
    startVideoCall,
    uploadTrainingMedia,
    trainAIModel,
    isTrainingAI,
    trainingProgress,
    sendVoiceMessage,
    shareMemory,
    addTribute,
    getMemoryTimeline,
    scheduleAnniversaryReminder
  } = useLovedOnes();

  const [selectedTab, setSelectedTab] = useState<'gallery' | 'chat' | 'video' | 'setup' | 'timeline' | 'memorial'>('gallery');
  const [showAddModal, setShowAddModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [memoryTimeline, setMemoryTimeline] = useState<any[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<any>(null);
  const [showMemorialShare, setShowMemorialShare] = useState(false);
  const [tributeText, setTributeText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [anniversaryDate, setAnniversaryDate] = useState(new Date());
  const [showAnniversaryModal, setShowAnniversaryModal] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (activeLovedOne) {
      setChatHistory(activeLovedOne.chatHistory);
      // Load memory timeline when loved one is selected
      loadMemoryTimeline();
    }
  }, [activeLovedOne]);

  const loadMemoryTimeline = async () => {
    if (activeLovedOne) {
      try {
        const timeline = await getMemoryTimeline(activeLovedOne.id);
        setMemoryTimeline(timeline);
      } catch (error) {
        console.log('Error loading timeline:', error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !activeLovedOne) return;

    try {
      const response = await sendMessage(activeLovedOne.id, chatMessage.trim());
      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        lovedOneId: activeLovedOne.id,
        sender: 'user',
        message: chatMessage.trim(),
        emotion: 'hopeful',
        timestamp: new Date(),
        aiConfidence: 1.0
      }, response]);
      setChatMessage('');
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleVideoCall = async () => {
    if (!activeLovedOne) return;
    
    if (!activeLovedOne.aiModel.isReady) {
      Alert.alert(
        'AI Model Not Ready',
        'The AI model is still training. Please wait for training to complete before starting a video call.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsVideoCallActive(true);
      await startVideoCall(activeLovedOne.id);
      
      setTimeout(() => {
        setIsVideoCallActive(false);
        Alert.alert(
          'Call Ended',
          `Your call with ${activeLovedOne.name} has ended. The memories you shared will be cherished forever.`,
          [{ text: 'OK' }]
        );
      }, 30000);
      
    } catch (error) {
      setIsVideoCallActive(false);
      Alert.alert('Error', 'Failed to start video call. Please try again.');
    }
  };

  const handleMediaUpload = async (type: 'photo' | 'video') => {
    if (!activeLovedOne) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === 'photo' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadProgress(0);
        
        const uploadInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 100) {
              clearInterval(uploadInterval);
              return 100;
            }
            return prev + 10;
          });
        }, 200);

        await uploadTrainingMedia(activeLovedOne.id, type, result.assets[0].uri);
        
        Alert.alert(
          'Upload Complete',
          `${type === 'photo' ? 'Photo' : 'Video'} uploaded successfully! The AI model will be retrained to better represent ${activeLovedOne.name}.`,
          [
            {
              text: 'Retrain AI Now',
              onPress: () => trainAIModel(activeLovedOne.id)
            },
            { text: 'Later', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload media. Please try again.');
    }
  };

  const renderMemorialCard = (lovedOne: LovedOne) => (
    <TouchableOpacity
      key={lovedOne.id}
      style={styles.memorialCard}
      onPress={() => {
        setActiveLovedOne(lovedOne);
        setSelectedTab('chat');
      }}
    >
                    <Image source={{ uri: lovedOne.profileImage }} style={styles.memorialPhoto} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.memorialOverlay}
      >
        <View style={styles.memorialInfo}>
          <Text style={styles.memorialName}>{lovedOne.name}</Text>
          <Text style={styles.memorialRelationship}>{lovedOne.relationship}</Text>
          <Text style={styles.memorialDates}>
                            {new Date(lovedOne.dateOfBirth).getFullYear()} - {new Date(lovedOne.dateOfPassing).getFullYear()}
          </Text>
          
          <View style={[styles.aiStatusBadge, { 
            backgroundColor: lovedOne.aiModel.isReady ? '#4CAF50' : '#FF9800' 
          }]}>
            <Ionicons 
              name={lovedOne.aiModel.isReady ? 'checkmark-circle' : 'time'} 
              size={12} 
              color="white" 
            />
            <Text style={styles.aiStatusText}>
              {lovedOne.aiModel.isReady ? 'AI Ready' : 'Training...'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderChatMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.chatMessage,
      item.sender === 'user' ? styles.userMessage : styles.aiMessage
    ]}>
      {item.sender === 'ai' && (
        <Image 
                        source={{ uri: activeLovedOne?.profileImage }} 
          style={styles.chatAvatar}
        />
      )}
      <View style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.aiBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.sender === 'user' ? styles.userText : styles.aiText
        ]}>
          {item.message}
        </Text>
        <Text style={styles.messageTime}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        {item.sender === 'ai' && (
          <Text style={styles.confidenceText}>
            AI Confidence: {Math.round(item.aiConfidence * 100)}%
          </Text>
        )}
      </View>
    </View>
  );

  const renderGalleryTab = () => (
    <ScrollView contentContainerStyle={styles.galleryContainer}>
      <View style={styles.galleryHeader}>
        <Text style={styles.galleryTitle}>💖 Your Loved Ones</Text>
        <Text style={styles.gallerySubtitle}>
          Connect with those who live on in your heart
        </Text>
      </View>

      <View style={styles.memorialGrid}>
        {lovedOnes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#999" />
            <Text style={styles.emptyText}>No loved ones added yet</Text>
            <Text style={styles.emptySubtext}>
              Add your first loved one to start your healing journey
            </Text>
          </View>
        ) : (
          <View style={styles.memorialRowContainer}>
            {lovedOnes.map((item) => renderMemorialCard(item))}
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.addButtonGradient}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add Loved One</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderChatTab = () => {
    if (!activeLovedOne) {
      return (
        <View style={styles.noChatState}>
          <Ionicons name="chatbubbles-outline" size={64} color="#999" />
          <Text style={styles.noChatText}>Select a loved one to start chatting</Text>
        </View>
      );
    }

    return (
      <View style={styles.chatContainer}>
        <View style={styles.chatHeader}>
          <Image source={{ uri: activeLovedOne.profileImage }} style={styles.chatHeaderAvatar} />
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderName}>{activeLovedOne.name}</Text>
            <Text style={styles.chatHeaderStatus}>
              {activeLovedOne.aiModel.isReady ? '✨ AI Ready to chat' : '🔄 Training AI model...'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.videoCallButton}
            onPress={handleVideoCall}
            disabled={!activeLovedOne.aiModel.isReady}
          >
            <Ionicons name="videocam" size={24} color={activeLovedOne.aiModel.isReady ? '#4CAF50' : '#999'} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatMessages}
          showsVerticalScrollIndicator={false}
        >
          {chatHistory.map((item) => renderChatMessage({ item }))}
        </ScrollView>

        <View style={styles.chatInputContainer}>
          <TouchableOpacity 
            style={[styles.voiceButton, isRecordingVoice && styles.voiceButtonActive]}
            onPress={() => {
              if (isRecordingVoice) {
                setIsRecordingVoice(false);
                // Simulate voice message sending
                setTimeout(async () => {
                  try {
                    const voiceResponse = await sendVoiceMessage(activeLovedOne.id, 'voice_recording_uri');
                    setChatHistory(prev => [...prev, voiceResponse]);
                  } catch (error) {
                    Alert.alert('Error', 'Failed to send voice message');
                  }
                }, 1000);
              } else {
                setIsRecordingVoice(true);
                Alert.alert('Voice Recording', 'Recording voice message...', [
                  { text: 'Stop', onPress: () => setIsRecordingVoice(false) }
                ]);
              }
            }}
            disabled={!activeLovedOne.aiModel.isReady}
          >
            <Ionicons 
              name={isRecordingVoice ? "stop" : "mic"} 
              size={20} 
              color={isRecordingVoice ? "white" : (activeLovedOne.aiModel.isReady ? '#667eea' : '#999')} 
            />
          </TouchableOpacity>
          
          <TextInput
            style={styles.chatInput}
            placeholder={`Message ${activeLovedOne.name}...`}
            value={chatMessage}
            onChangeText={setChatMessage}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity 
            style={[styles.sendButton, !chatMessage.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!chatMessage.trim() || !activeLovedOne.aiModel.isReady}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderVideoTab = () => {
    if (!activeLovedOne) {
      return (
        <View style={styles.noVideoState}>
          <Ionicons name="videocam-outline" size={64} color="#999" />
          <Text style={styles.noVideoText}>Select a loved one for video calls</Text>
        </View>
      );
    }

    return (
      <View style={styles.videoContainer}>
        {isVideoCallActive ? (
          <View style={styles.activeCall}>
            <Image source={{ uri: activeLovedOne.profileImage }} style={styles.videoAvatar} />
            <Text style={styles.videoCallText}>Connected with {activeLovedOne.name}</Text>
            <Text style={styles.videoCallSubtext}>AI-powered real-time conversation</Text>
            
            <TouchableOpacity 
              style={styles.endCallButton}
              onPress={() => setIsVideoCallActive(false)}
            >
              <Ionicons name="call" size={24} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.videoSetup}>
            <Image source={{ uri: activeLovedOne.profileImage }} style={styles.videoSetupAvatar} />
            <Text style={styles.videoSetupName}>{activeLovedOne.name}</Text>
            <Text style={styles.videoSetupText}>
              {activeLovedOne.aiModel.isReady 
                ? 'Ready for AI video call' 
                : `AI model training: ${Math.round(activeLovedOne.aiModel.trainingProgress)}%`
              }
            </Text>
            
            {activeLovedOne.aiModel.isReady ? (
              <TouchableOpacity style={styles.startCallButton} onPress={handleVideoCall}>
                <LinearGradient
                  colors={['#4CAF50', '#45a049']}
                  style={styles.startCallGradient}
                >
                  <Ionicons name="videocam" size={24} color="white" />
                  <Text style={styles.startCallText}>Start Video Call</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.trainingProgress}>
                <View style={styles.progressBar}>
                  <View 
                    style={[styles.progressFill, { 
                      width: `${activeLovedOne.aiModel.trainingProgress}%` 
                    }]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  Training AI model... {Math.round(activeLovedOne.aiModel.trainingProgress)}%
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderSetupTab = () => {
    if (!activeLovedOne) {
      return (
        <View style={styles.noSetupState}>
          <Ionicons name="settings-outline" size={64} color="#999" />
          <Text style={styles.noSetupText}>Select a loved one to manage AI training</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.setupContainer}>
        <View style={styles.setupHeader}>
          <Image source={{ uri: activeLovedOne.profileImage }} style={styles.setupAvatar} />
          <Text style={styles.setupName}>{activeLovedOne.name}</Text>
          <Text style={styles.setupAccuracy}>
            AI Accuracy: {Math.round(activeLovedOne.aiModel.accuracy)}%
          </Text>
        </View>

        <View style={styles.setupSection}>
          <Text style={styles.setupSectionTitle}>📸 Training Media</Text>
          <View style={styles.mediaButtons}>
            <TouchableOpacity 
              style={styles.mediaButton}
              onPress={() => handleMediaUpload('photo')}
            >
              <Ionicons name="camera" size={24} color="#667eea" />
              <Text style={styles.mediaButtonText}>Upload Photos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.mediaButton}
              onPress={() => handleMediaUpload('video')}
            >
              <Ionicons name="videocam" size={24} color="#667eea" />
              <Text style={styles.mediaButtonText}>Upload Videos</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.setupSection}>
          <Text style={styles.setupSectionTitle}>🤖 AI Training</Text>
          <TouchableOpacity 
            style={[styles.trainButton, isTrainingAI && styles.trainButtonDisabled]}
            onPress={() => trainAIModel(activeLovedOne.id)}
            disabled={isTrainingAI}
          >
            <LinearGradient
              colors={isTrainingAI ? ['#999', '#666'] : ['#FF6B6B', '#FF5722']}
              style={styles.trainButtonGradient}
            >
              <Ionicons 
                name={isTrainingAI ? "hourglass" : "flash"} 
                size={20} 
                color="white" 
              />
              <Text style={styles.trainButtonText}>
                {isTrainingAI ? `Training... ${trainingProgress.toFixed(0)}%` : 'Retrain AI Model'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <View style={styles.uploadProgress}>
            <Text style={styles.uploadText}>Uploading media...</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderTimelineTab = () => {
    if (!activeLovedOne) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>Select a loved one to view their timeline</Text>
        </View>
      );
    }

    const timelineItems = [
      {
        id: '1',
        type: 'birthday',
        date: new Date(activeLovedOne.dateOfBirth),
        title: `${activeLovedOne.name} was born`,
        description: 'A beautiful soul entered this world',
        icon: 'gift',
        color: '#FFD700'
      },
      {
        id: '2',
        type: 'memory',
        date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        title: 'Last Birthday Together',
        description: 'Celebrating another year of wonderful memories',
        icon: 'cake',
        color: '#FF69B4'
      },
      {
        id: '3',
        type: 'interaction',
        date: new Date(activeLovedOne.lastInteraction),
        title: 'Latest Conversation',
        description: 'Our most recent heart-to-heart chat',
        icon: 'chatbubbles',
        color: '#4CAF50'
      },
      {
        id: '4',
        type: 'passing',
        date: new Date(activeLovedOne.dateOfPassing),
        title: 'Gained angel wings',
        description: 'Forever in our hearts and memories',
        icon: 'heart',
        color: '#E1306C'
      }
    ];

    return (
      <ScrollView style={styles.timelineContainer}>
        <View style={styles.timelineHeader}>
          <Text style={styles.timelineTitle}>Memory Timeline</Text>
          <Text style={styles.timelineSubtitle}>Cherished moments with {activeLovedOne.name}</Text>
        </View>

        {timelineItems.map((item, index) => (
          <View key={item.id} style={styles.timelineItem}>
            <View style={styles.timelineIconContainer}>
              <View style={[styles.timelineIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon as any} size={20} color="white" />
              </View>
              {index < timelineItems.length - 1 && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineItemTitle}>{item.title}</Text>
              <Text style={styles.timelineItemDescription}>{item.description}</Text>
              <Text style={styles.timelineDate}>
                {item.date.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
          </View>
        ))}

        <TouchableOpacity 
          style={styles.addMemoryButton}
          onPress={() => Alert.alert('Add Memory', 'This feature will allow you to add new memories to the timeline')}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.addMemoryGradient}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.addMemoryText}>Add Memory</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderMemorialTab = () => {
    if (!activeLovedOne) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>Select a loved one to view their memorial</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.memorialContainer}>
        <View style={styles.memorialHeaderSection}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.memorialHeaderGradient}
          >
            <Image source={{ uri: activeLovedOne.profileImage }} style={styles.memorialHeaderPhoto} />
            <Text style={styles.memorialHeaderName}>{activeLovedOne.name}</Text>
            <Text style={styles.memorialHeaderDates}>
              {new Date(activeLovedOne.dateOfBirth).getFullYear()} - {new Date(activeLovedOne.dateOfPassing).getFullYear()}
            </Text>
            <Text style={styles.memorialHeaderRelation}>Beloved {activeLovedOne.relationship}</Text>
          </LinearGradient>
        </View>

        <View style={styles.memorialActions}>
          <TouchableOpacity 
            style={styles.memorialActionButton}
            onPress={() => setShowMemorialShare(true)}
          >
            <Ionicons name="share" size={20} color="#667eea" />
            <Text style={styles.memorialActionText}>Share Memorial</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.memorialActionButton}
            onPress={() => setShowAnniversaryModal(true)}
          >
            <Ionicons name="calendar" size={20} color="#667eea" />
            <Text style={styles.memorialActionText}>Set Reminder</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.memorialActionButton}
            onPress={() => {
              setAuthorName('');
              setTributeText('');
              Alert.prompt(
                'Leave a Tribute',
                'Share a memory or message',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Submit', 
                    onPress: (text) => {
                      if (text) {
                        addTribute(activeLovedOne.id, text, 'Anonymous');
                        Alert.alert('Thank You', 'Your tribute has been added');
                      }
                    }
                  }
                ],
                'plain-text'
              );
            }}
          >
            <Ionicons name="flower" size={20} color="#667eea" />
            <Text style={styles.memorialActionText}>Leave Tribute</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.memorialQuotes}>
          <Text style={styles.memorialSectionTitle}>Favorite Quotes</Text>
          {activeLovedOne.personalityProfile.quotes.map((quote, index) => (
            <View key={index} style={styles.quoteCard}>
              <Text style={styles.quoteText}>"{quote}"</Text>
              <Text style={styles.quoteAuthor}>- {activeLovedOne.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.memorialTraits}>
          <Text style={styles.memorialSectionTitle}>Beautiful Qualities</Text>
          <View style={styles.traitsContainer}>
            {activeLovedOne.personalityProfile.traits.map((trait, index) => (
              <View key={index} style={styles.traitBadge}>
                <Text style={styles.traitText}>{trait}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.memorialHobbies}>
          <Text style={styles.memorialSectionTitle}>Loved To Do</Text>
          <View style={styles.hobbiesContainer}>
            {activeLovedOne.personalityProfile.hobbies.map((hobby, index) => (
              <View key={index} style={styles.hobbyItem}>
                <Ionicons name="heart" size={16} color="#E1306C" />
                <Text style={styles.hobbyText}>{hobby}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>💝 Luma Loved Ones</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.tabContainer}>
          {[
            { key: 'gallery', icon: 'images', label: 'Gallery' },
            { key: 'chat', icon: 'chatbubbles', label: 'Chat' },
            { key: 'video', icon: 'videocam', label: 'Video' },
            { key: 'timeline', icon: 'time', label: 'Timeline' },
            { key: 'memorial', icon: 'heart', label: 'Memorial' },
            { key: 'setup', icon: 'settings', label: 'Setup' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
              onPress={() => setSelectedTab(tab.key as any)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={20} 
                color={selectedTab === tab.key ? '#667eea' : '#999'} 
              />
              <Text style={[
                styles.tabText, 
                selectedTab === tab.key && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabContent}>
          {selectedTab === 'gallery' && renderGalleryTab()}
          {selectedTab === 'chat' && renderChatTab()}
          {selectedTab === 'video' && renderVideoTab()}
          {selectedTab === 'timeline' && renderTimelineTab()}
          {selectedTab === 'memorial' && renderMemorialTab()}
          {selectedTab === 'setup' && renderSetupTab()}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 34,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#667eea',
  },
  tabText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  activeTabText: {
    color: '#667eea',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  galleryContainer: {
    padding: 20,
  },
  galleryHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  galleryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  gallerySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  memorialRow: {
    justifyContent: 'space-between',
  },
  memorialGrid: {
    flex: 1,
  },
  memorialRowContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  memorialCard: {
    width: width * 0.42,
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  memorialPhoto: {
    width: '100%',
    height: '100%',
  },
  memorialOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 15,
  },
  memorialInfo: {
    alignItems: 'flex-start',
  },
  memorialName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  memorialRelationship: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  memorialDates: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  aiStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  aiStatusText: {
    fontSize: 10,
    color: 'white',
    marginLeft: 4,
    fontWeight: '600',
  },
  addButton: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 250,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chatHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  chatHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  chatHeaderStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  videoCallButton: {
    padding: 8,
  },
  chatMessages: {
    flex: 1,
    paddingHorizontal: 15,
  },
  chatMessage: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  chatAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#667eea',
    borderBottomRightRadius: 5,
  },
  aiBubble: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
  },
  userText: {
    color: 'white',
  },
  aiText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  confidenceText: {
    fontSize: 9,
    color: '#999',
    marginTop: 2,
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
  },
  voiceButton: {
    backgroundColor: '#f0f0f0',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  voiceButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#667eea',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  noChatState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noChatText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  activeCall: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  videoAvatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  videoCallText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  videoCallSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 40,
  },
  endCallButton: {
    backgroundColor: '#F44336',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoSetup: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  videoSetupAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  videoSetupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  videoSetupText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  startCallButton: {
    marginTop: 20,
  },
  startCallGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  startCallText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  trainingProgress: {
    alignItems: 'center',
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  noVideoState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noVideoText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  setupContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  setupHeader: {
    alignItems: 'center',
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  setupAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  setupName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  setupAccuracy: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  setupSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  setupSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  mediaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mediaButton: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#667eea',
    borderRadius: 10,
  },
  mediaButtonText: {
    color: '#667eea',
    fontWeight: '600',
    marginTop: 8,
  },
  trainButton: {
    marginTop: 10,
  },
  trainButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
  },
  trainButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  trainButtonDisabled: {
    opacity: 0.6,
  },
  uploadProgress: {
    padding: 20,
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  noSetupState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noSetupText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  // Timeline Tab Styles
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  timelineContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  timelineHeader: {
    alignItems: 'center',
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  timelineTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  timelineSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  timelineItem: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-start',
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#ddd',
    marginTop: 5,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  timelineItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  timelineDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  addMemoryButton: {
    margin: 20,
  },
  addMemoryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
  },
  addMemoryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Memorial Tab Styles
  memorialContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  memorialHeaderSection: {
    marginBottom: 20,
  },
  memorialHeaderGradient: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  memorialHeaderPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 4,
    borderColor: 'white',
  },
  memorialHeaderName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  memorialHeaderDates: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 5,
  },
  memorialHeaderRelation: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  memorialActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 20,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  memorialActionButton: {
    alignItems: 'center',
    flex: 1,
  },
  memorialActionText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
    marginTop: 5,
  },
  memorialSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  memorialQuotes: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quoteCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  quoteText: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  memorialTraits: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  traitBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    margin: 3,
  },
  traitText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  memorialHobbies: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hobbiesContainer: {
    flexDirection: 'column',
  },
  hobbyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  hobbyText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
}); 