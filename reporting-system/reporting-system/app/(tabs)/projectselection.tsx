import React, { useState, useEffect } from "react";
import {View, Text,StyleSheet,PermissionsAndroid,Platform,} from "react-native";

type Location = {
  latitude: number;
  longitude: number;
};

export default function App() {
  const [location, setLocation] = useState<Location | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
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

    requestLocationPermission();
  }, []);

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    color: "#000",
    fontSize: 24,
    marginTop: 40,
  },
  text: {
    color: "#000",
    fontSize: 18,
    marginTop: 20,
  },
});
