import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

interface ImagePickerProps {
  onImageSelected: (uri: string) => void;
  onImageRemoved: () => void;
  selectedImage?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export const ImagePickerComponent: React.FC<ImagePickerProps> = ({
  onImageSelected,
  onImageRemoved,
  selectedImage,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to make this work!',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera permissions to make this work!',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const processImage = async (uri: string) => {
    try {
      const processedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxWidth, height: maxHeight } }],
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      onImageSelected(processedImage.uri);
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Image',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
      ]
    );
  };

  const removeImage = () => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: onImageRemoved },
      ]
    );
  };

  if (selectedImage) {
    return (
      <View style={styles.imageContainer}>
        <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
        <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
          <Ionicons name="close-circle" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.changeButton} onPress={showImageOptions}>
          <Ionicons name="camera" size={20} color="#fff" />
          <Text style={styles.changeButtonText}>Change</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.uploadButton, isLoading && styles.uploadButtonLoading]}
      onPress={showImageOptions}
      disabled={isLoading}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass" size={24} color="#65676b" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      ) : (
        <>
          <Ionicons name="camera" size={32} color="#65676b" />
          <Text style={styles.uploadText}>Add Photo</Text>
          <Text style={styles.uploadSubtext}>Tap to add an image</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  uploadButton: {
    borderWidth: 2,
    borderColor: '#e4e6eb',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    minHeight: 120,
  },
  uploadButtonLoading: {
    opacity: 0.6,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#65676b',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1e21',
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#65676b',
    marginTop: 4,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 4,
  },
  changeButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
}); 