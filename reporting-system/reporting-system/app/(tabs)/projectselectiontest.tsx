import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, PermissionsAndroid, Platform } from "react-native";

type Location = {
  latitude: number;
  longitude: number;
};

type PanelData = {
  heading: string;
  subheading: {
    type: string;
    location: string;
    region: string;
    status: string;
    completionDate: string;
  };
  buttonText: string;
};

export default function App() {
  const [location, setLocation] = useState<Location | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const requestLocationPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "This app needs access to your location.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setErrorMsg("Location permission denied");
        return;
      }
    }
    getLocation();
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
      },
      (error) => {
        setErrorMsg(error.message);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const panelData1: PanelData = {
    heading: "TEST: Downtown Transit Expansion",
    subheading: {
      type: "Transit",
      location: "123 Transit Avenue",
      region: "Central",
      status: "Under Construction",
      completionDate: "2025-12-01",
    },
    buttonText: "TEST: Downtown Transit Expansion",
  };

  const panelData2: PanelData = {
    heading: "TEST: Building Construction",
    subheading: {
      type: "Communities",
      location: "123 Transit Avenue",
      region: "Central",
      status: "Under Construction",
      completionDate: "2025-05-01",
    },
    buttonText: "TEST: Building Construction",
  };

  const panelData3: PanelData = {
    heading: "TEST: Highway 401 Expansion",
    subheading: {
      type: "Roads/Bridges",
      location: "Highway 401 between Markham and Kennedy Road",
      region: "East",
      status: "Under Construction",
      completionDate: "2024-12-01",
    },
    buttonText: "TEST: Highway 401 Expansion",
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Project Selection</Text>
      {location ? (
        <Text style={styles.text}>
          Location: Latitude {location.latitude}, Longitude {location.longitude}
        </Text>
      ) : errorMsg ? (
        <Text style={styles.text}>Error: {errorMsg}</Text>
      ) : (
        <Text style={styles.text}>Fetching location...</Text>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Panel panelData={panelData1} />
        <Panel panelData={panelData2} />
        <Panel panelData={panelData3} />
      </ScrollView>
    </View>
  );
}

const Panel = ({ panelData }: { panelData: PanelData }) => (
  <View style={styles.panel}>
    <View style={styles.header}>
      <View style={styles.circle} />
      <Text style={styles.headerText}>
        {panelData.heading}
      </Text>
    </View>
    <View style={styles.subheadingContainer}>
      <Text style={styles.subheadingLabel}>Type:</Text>
      <Text style={styles.subheadingValue}>{panelData.subheading.type}</Text>
    </View>
    <View style={styles.subheadingContainer}>
      <Text style={styles.subheadingLabel}>Location:</Text>
      <Text style={styles.subheadingValue}>{panelData.subheading.location}</Text>
    </View>
    <View style={styles.subheadingContainer}>
      <Text style={styles.subheadingLabel}>Region:</Text>
      <Text style={styles.subheadingValue}>{panelData.subheading.region}</Text>
    </View>
    <View style={styles.subheadingContainer}>
      <Text style={styles.subheadingLabel}>Status:</Text>
      <Text style={styles.subheadingValue}>{panelData.subheading.status}</Text>
    </View>
    <View style={styles.subheadingContainer}>
      <Text style={styles.subheadingLabel}>Completion Date:</Text>
      <Text style={styles.subheadingValue}>{panelData.subheading.completionDate}</Text>
    </View>
    <TouchableOpacity style={styles.button}>
      <Text style={styles.buttonText}>{panelData.buttonText}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff", // Ensure background is white
      paddingTop: 40,
      alignItems: "center", // Align content to the center
    },
    title: {
      color: "#000",
      fontSize: 24,
      textAlign: "center",
      marginBottom: 20,
    },
    text: {
      color: "#000",
      fontSize: 18,
      textAlign: "center",
      marginBottom: 20,
    },
    scrollContent: {
      paddingHorizontal: 20,
      alignItems: "center",
      paddingBottom: 60, // Increased space at the bottom for scrolling
      flexGrow: 1, // Ensures ScrollView content grows as needed
    },
    panel: {
      width: "100%", // Make panels wider
      maxWidth: 450, // Set a maximum width to ensure they don't get too wide on large screens
      backgroundColor: "#fff",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#000",
      padding: 15,
      marginBottom: 20, // Increased bottom margin for spacing between panels
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    circle: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: "#007BFF",
      marginRight: 8,
    },
    headerText: {
      fontSize: 16,
      fontWeight: "bold",
    },
    subheadingContainer: {
      flexDirection: "row",
      marginBottom: 8,
      alignItems: "center",
    },
    subheadingLabel: {
      fontSize: 13,
      fontWeight: "bold", // Make the label bold
      marginRight: 10,
      width: 130, // Increased width of labels to accommodate longer values
    },
    subheadingValue: {
      fontSize: 13,
      fontWeight: "normal", // Make the value regular
      flex: 1, // Let the value take the remaining space
    },
    button: {
      backgroundColor: "#007BFF",
      borderRadius: 20, // Increased to make the button more rounded
      paddingVertical: 12, // Increased padding for a larger button
      paddingHorizontal: 20, // Increased padding for a larger button
      marginTop: 10,
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "normal", // Change fontWeight to "normal" to make the text non-bolded
    },
  });
