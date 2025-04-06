import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { router, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEV_API_URL = __DEV__ 
  ? 'http://192.168.2.38:5000'  // Development server (your computer's IP)
  : 'http://localhost:5000';     // Production server

const ReportCreationPage = () => {
  const { projectId, projectName } = useLocalSearchParams();
  const [title, setTitle] = useState("");
  const [mainText, setMainText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const takePhoto = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === "granted") {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,  // Increased from 0.05 to 0.7
        base64: true,
        exif: false,    // Exclude EXIF data
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
      quality: 0.05,  // Extremely reduced quality
      base64: true,
      exif: false,    // Exclude EXIF data
    });

    if (!result.canceled && result.assets[0].base64) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMessage('Permission to access location was denied');
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (error) {
        setErrorMessage('Error fetching location');
      }
    })();
  }, []);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const { role } = JSON.parse(userData);
          setIsAdmin(role === 'admin');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };
    
    checkUserRole();
  }, []);

  const handleCreateReport = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        Alert.alert('Error', 'User data not found');
        return;
      }
      const { id: userId } = JSON.parse(userData);

      if (!title || !mainText) {
        alert("Title and description are required");
        return;
      }

      const reportData = {
        title,
        body: mainText,
        project: projectId,
        user: userId,
        image: image || undefined,
        location: {
          type: "Point",
          coordinates: location ? [location.coords.longitude, location.coords.latitude] : [0, 0]
        }
      };

      const response = await fetch(`${DEV_API_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(`Server error: ${response.status}\nDetails: ${JSON.stringify(errorData)}`);
      }

      Alert.alert(
        "Success",
        "Report created successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              router.back();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error details:', error);
      Alert.alert('Error', 'Failed to create report');
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
          <Text style={styles.title}>Create Report for {projectName}</Text>
        </View>

        {/* Combined Report Details Panel */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={[styles.headerText, { marginBottom: 0 }]}>Report Details</Text>
            <TouchableOpacity style={styles.createButton} onPress={handleCreateReport}>
              <Text style={styles.buttonText}>Create</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.titleInput}
            placeholder="Enter report title"
            value={title}
            onChangeText={setTitle}
          />
          
          <Text style={[styles.headerText, { marginTop: 20 }]}>Add Image</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={takePhoto}>
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <Text style={styles.buttonText}>Upload Image</Text>
            </TouchableOpacity>
          </View>
          {image && (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: image }} 
                style={styles.uploadedImage}
              />
              <TouchableOpacity 
                style={styles.deleteImageButton}
                onPress={() => setImage(null)}
              >
                <Text style={[styles.buttonText, { fontSize: 12 }]}>Delete Image</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <TextInput
            style={styles.bodyInput}
            multiline
            placeholder="Enter main text"
            value={mainText}
            onChangeText={setMainText}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    textAlign: "center",
  },
  panel: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e1e4e8",
    padding: 25,
    marginBottom: 20,
    alignSelf: 'center',
    minHeight: 600,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    width: '100%',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#007BFF",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  createButton: {
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
  titleInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    width: "100%",
    height: 50,
    fontWeight: 'bold',
    marginTop: 15,
  },
  bodyInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    width: "100%",
    height: 350,
    marginTop: 15,
    textAlignVertical: 'top',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  uploadedImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  deleteImageButton: {
    backgroundColor: '#dc3545',  // Red color for delete
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
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
});

export default ReportCreationPage;