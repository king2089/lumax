import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ImagePickerComponent } from '../components/ImagePicker';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { MoodRayGlow } from '../components/MoodRayGlow';
import { useMood } from '../context/MoodContext';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, responsiveStyle } from '../utils/responsive';

export const CreatePostScreen: React.FC = () => {
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation = useNavigation();
  const { addPost } = useApp();
  const { user } = useAuth();
  const { detectMoodFromActivity } = useMood();

  const handleSubmit = async () => {
    if (!content.trim() && selectedImages.length === 0) {
      Alert.alert('Error', 'Please add some content or images to your post.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Detect mood based on post content
      const moodKeywords = content.toLowerCase();
      if (moodKeywords.includes('happy') || moodKeywords.includes('excited') || moodKeywords.includes('amazing')) {
        detectMoodFromActivity('happy post');
      } else if (moodKeywords.includes('work') || moodKeywords.includes('productive') || moodKeywords.includes('busy')) {
        detectMoodFromActivity('productive post');
      } else if (moodKeywords.includes('creative') || moodKeywords.includes('art') || moodKeywords.includes('design')) {
        detectMoodFromActivity('creative post');
      } else if (moodKeywords.includes('friends') || moodKeywords.includes('social') || moodKeywords.includes('party')) {
        detectMoodFromActivity('social post');
      } else {
        detectMoodFromActivity('create post');
      }

      const newPost = {
        id: Date.now().toString(),
        userId: user?.id || '1',
        content: content.trim(),
        images: selectedImages,
        reactions: {},
        comments: [],
        shares: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isEdited: false,
        tags: extractHashtags(content),
        privacy: 'public' as const,
        contentTags: {
          isNSFW: false,
          isSensitive: false,
          ageRestriction: 13,
          categories: [],
        },
        moderation: {
          isReported: false,
          reportCount: 0,
          isHidden: false,
          moderationStatus: 'approved' as const,
          reportReasons: [],
        },
      };

      addPost(newPost);
      
      Alert.alert(
        'Success!',
        'Your post has been created successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[\w]+/g;
    return text.match(hashtagRegex)?.map(tag => tag.slice(1)) || [];
  };

  const handleImageSelect = (images: string[]) => {
    setSelectedImages(images);
    if (images.length > 0) {
      detectMoodFromActivity('add photos to post');
    }
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
  };

  const characterCount = content.length;
  const maxCharacters = 500;

  return (
    <View style={styles.wrapper}>
      <MoodRayGlow
        mood="creative"
        intensity={0.6}
        enabled={true}
      />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'transparent']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <Text style={styles.headerTitle}>Create Post</Text>
              
              <TouchableOpacity
                style={[
                  styles.postButton,
                  (!content.trim() && selectedImages.length === 0) && styles.postButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={(!content.trim() && selectedImages.length === 0) || isSubmitting}
              >
                <LinearGradient
                  colors={(!content.trim() && selectedImages.length === 0) ? 
                    ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : 
                    ['#00C853', '#64DD17']}
                  style={styles.postButtonGradient}
                >
                  <Text style={styles.postButtonText}>
                    {isSubmitting ? 'Posting...' : 'Post'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* User Info */}
            <View style={styles.userInfo}>
              <LinearGradient
                colors={['#00C853', '#64DD17']}
                style={styles.userImageContainer}
              >
                <Text style={styles.userInitial}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </LinearGradient>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user?.email || 'User'}</Text>
                <Text style={styles.postPrivacy}>Public post</Text>
              </View>
            </View>

            {/* Content Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.contentInput}
                placeholder="What's on your mind?"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
                maxLength={maxCharacters}
              />
              
              {/* Character Count */}
              <View style={styles.characterCountContainer}>
                <Text style={[
                  styles.characterCount,
                  characterCount > maxCharacters * 0.8 && styles.characterCountWarning
                ]}>
                  {characterCount}/{maxCharacters}
                </Text>
              </View>
            </View>

            {/* Selected Images */}
            {selectedImages.length > 0 && (
              <View style={styles.imagesContainer}>
                <Text style={styles.imagesTitle}>Selected Images ({selectedImages.length})</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {selectedImages.map((image, index) => (
                    <View key={index} style={styles.imageItem}>
                      <Image
                        source={{ uri: image }}
                        style={styles.selectedImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons name="close-circle" size={24} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Image Picker */}
            <View style={styles.imagePickerContainer}>
              <Text style={styles.imagePickerTitle}>Add Photos</Text>
              <ImagePickerComponent
                onImageSelected={(image) => handleImageSelect([image])}
                onImageRemoved={() => setSelectedImages([])}
                selectedImage={selectedImages[0]}
              />
            </View>

            {/* Post Options */}
            <View style={styles.optionsContainer}>
              <Text style={styles.optionsTitle}>Post Options</Text>
              
              <View style={styles.optionItem}>
                <Ionicons name="people" size={20} color="#00C853" />
                <Text style={styles.optionText}>Who can see this post?</Text>
                <Text style={styles.optionValue}>Public</Text>
              </View>
              
              <View style={styles.optionItem}>
                <Ionicons name="location" size={20} color="#00C853" />
                <Text style={styles.optionText}>Add location</Text>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
              </View>
              
              <View style={styles.optionItem}>
                <Ionicons name="happy" size={20} color="#00C853" />
                <Text style={styles.optionText}>How are you feeling?</Text>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: responsiveStyle({
    flex: 1,
    backgroundColor: '#000',
  }),
  container: responsiveStyle({
    flex: 1,
  }),
  keyboardAvoidingView: responsiveStyle({
    flex: 1,
  }),
  header: responsiveStyle({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 50,
    paddingBottom: 20,
  }),
  headerContent: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  }),
  cancelButton: responsiveStyle({
    padding: 8,
  }),
  cancelText: responsiveStyle({
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }),
  headerTitle: responsiveStyle({
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }),
  postButton: responsiveStyle({
    borderRadius: 20,
    overflow: 'hidden',
  }),
  postButtonDisabled: responsiveStyle({
    opacity: 0.5,
  }),
  postButtonGradient: responsiveStyle({
    paddingHorizontal: 20,
    paddingVertical: 10,
  }),
  postButtonText: responsiveStyle({
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }),
  content: responsiveStyle({
    flex: 1,
    paddingTop: 100,
  }),
  userInfo: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  }),
  userImageContainer: responsiveStyle({
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  }),
  userInitial: responsiveStyle({
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  }),
  userDetails: responsiveStyle({
    marginLeft: 15,
  }),
  userName: responsiveStyle({
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }),
  postPrivacy: responsiveStyle({
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  }),
  inputContainer: responsiveStyle({
    paddingHorizontal: 20,
    paddingBottom: 20,
  }),
  contentInput: responsiveStyle({
    color: '#fff',
    fontSize: 18,
    lineHeight: 26,
    minHeight: 120,
    textAlignVertical: 'top',
  }),
  characterCount: responsiveStyle({
    alignSelf: 'flex-end',
    marginTop: 10,
  }),
  characterCountText: responsiveStyle({
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  }),
  imagesContainer: responsiveStyle({
    paddingHorizontal: 20,
    marginBottom: 20,
  }),
  imageGrid: responsiveStyle({
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  }),
  imageItem: responsiveStyle({
    position: 'relative',
  }),
  selectedImage: responsiveStyle({
    width: 100,
    height: 100,
    borderRadius: 8,
  }),
  removeImageButton: responsiveStyle({
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  }),
  toolsContainer: responsiveStyle({
    paddingHorizontal: 20,
    paddingBottom: 20,
  }),
  toolsTitle: responsiveStyle({
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  }),
  toolsGrid: responsiveStyle({
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  }),
  toolButton: responsiveStyle({
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    minWidth: 80,
  }),
  toolIcon: responsiveStyle({
    marginBottom: 8,
  }),
  toolText: responsiveStyle({
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  }),
  privacyContainer: responsiveStyle({
    paddingHorizontal: 20,
    paddingBottom: 20,
  }),
  privacyTitle: responsiveStyle({
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  }),
  privacyOptions: responsiveStyle({
    gap: 10,
  }),
  privacyOption: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 15,
  }),
  privacyOptionSelected: responsiveStyle({
    backgroundColor: 'rgba(0,200,83,0.3)',
  }),
  privacyIcon: responsiveStyle({
    marginRight: 12,
  }),
  privacyText: responsiveStyle({
    color: '#fff',
    fontSize: 16,
    flex: 1,
  }),
  privacyDescription: responsiveStyle({
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 4,
  }),
}); 