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
        if (!title || !mainText) {
            alert("Title and main text are required");
            return;
        }

        setErrorMessage('Starting request...');
        
        // Create the report data object
        const reportData = {
            title: title,
            body: mainText,
            user: "65f3c1d2f3c1d2f3c1d2f3c1",
            project: projectId,
            location: {
                type: "Point",
                coordinates: location ? 
                    [location.coords.longitude, location.coords.latitude] : 
                    [-79.3832, 43.6532]
            },
            image: image || undefined
        };

        console.log('Sending data:', JSON.stringify(reportData, null, 2));

        const response = await fetch(`${DEV_API_URL}/api/reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reportData)
        });

        const responseText = await response.text();
        console.log('Response:', responseText);

        if (response.ok) {
            Alert.alert(
                "Success", 
                isAdmin 
                    ? "Report created successfully!"
                    : "Report created successfully! Your report is awaiting admin approval.",
                [
                    {
                        text: "OK",
                        onPress: () => router.replace('/projectselection') // Navigate to project selection
                    }
                ]
            );
        } else {
            throw new Error(`Server error: ${response.status}\nDetails: ${responseText}`);
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
            style={[styles.textInput, { 
              height: 50,
              fontWeight: 'bold',
              marginTop: 15
            }]}
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
            style={[styles.textInput, { 
              height: 350,
              marginTop: 15,
              textAlignVertical: 'top'
            }]}
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
    color: "#000",
    fontSize: 24,
    textAlign: "center",
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
    minHeight: 600,
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
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#007BFF",
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
  textInput: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    padding: 10,
    width: "100%",
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