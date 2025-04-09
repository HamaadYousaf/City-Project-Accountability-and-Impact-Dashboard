import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEV_API_URL = __DEV__ 
  ? 'http://192.168.2.38:5000'
  : 'http://localhost:5000';

const AddCommentPage = () => {
  const { reportId, projectId, projectName } = useLocalSearchParams();
  const [commentText, setCommentText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const takePhoto = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === "granted") {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
        exif: false,
      });

      if (!result.canceled && result.assets[0].base64) {
        setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } else {
      alert("Camera permission is required to take photos.");
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
      exif: false,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleCreateComment = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        Alert.alert('Error', 'User data not found');
        return;
      }
      const { id: userId, role } = JSON.parse(userData);

      if (!commentText) {
        alert("Comment text is required");
        return;
      }

      const commentData = {
        body: commentText,
        report: reportId,
        user: userId,
        image: image || undefined
      };

      const response = await fetch(`${DEV_API_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData)
      });

      const rawResponse = await response.text();
      console.log('Raw server response:', rawResponse);

      // Check if response starts with '<' (indicating HTML)
      if (rawResponse.trim().startsWith('<')) {
        console.error('Received HTML instead of JSON:', rawResponse);
        throw new Error('Server returned HTML instead of JSON. The request might be too large.');
      }

      let responseData;
      try {
        responseData = JSON.parse(rawResponse);
      } catch (e) {
        console.error('Parse error details:', e);
        throw new Error('Failed to parse server response');
      }

      if (response.ok) {
        Alert.alert(
          "Success",
          "Comment added successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                const route = role === 'admin' ? '/viewreports' : '/viewreportsuser';
                router.replace({
                  pathname: route,
                  params: { projectId, projectName }
                });
              }
            }
          ]
        );
      } else {
        throw new Error(`Server error: ${response.status}\nDetails: ${responseData}`);
      }
    } catch (error: any) {
      console.error('Error details:', error);
      setErrorMessage(`Error: ${error.message}`);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.innerContainer}>
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}
        <View style={styles.header}>
          <Text style={styles.title}>Add Comment</Text>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.headerText}>Comment Details</Text>
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleCreateComment}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={[styles.commentInput, { 
              height: 150,
              textAlignVertical: 'top'
            }]}
            multiline
            placeholder="Enter your comment"
            value={commentText}
            onChangeText={setCommentText}
          />

          <Text style={[styles.headerText, { marginTop: 20, marginBottom: 10 }]}>
            Add Image
          </Text>
          <View style={styles.imageButtons}>
            <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Text style={styles.buttonText}>Upload Image</Text>
            </TouchableOpacity>
          </View>
          
          {image && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.previewImage} />
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => setImage(null)}
              >
                <Text style={styles.buttonText}>Remove Image</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  innerContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 25,
    textAlign: 'center',
  },
  panel: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    padding: 25,
    marginBottom: 20,
    alignSelf: 'center',
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#28a745",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "normal",
  },
  commentInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 80,
    marginBottom: 15,
  },
  errorContainer: {
    backgroundColor: '#ffcccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  errorText: {
    color: '#ff0000',
    fontWeight: 'bold',
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    marginTop: 10,
  },
  imageButton: {
    backgroundColor: '#007BFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 0.48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});

export default AddCommentPage; 