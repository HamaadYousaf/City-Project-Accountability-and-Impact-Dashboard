import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, PermissionsAndroid, Platform } from "react-native";
import { router } from 'expo-router';
import * as Location from 'expo-location';

type Location = {
  latitude: number;
  longitude: number;
};

type ProjectData = {
  _id: string;
  name: string;
  type: string;
  location: string;
  region: string;
  status: string;
  completionDate: string;
};

type PanelData = {
  id: string;
  heading: string;
  subheading: {
    type: string;
    location: string;
    region: string;
    status: string;
    completionDate: string;
  };
};

type Report = {
  title: string;
  body: string;
  location: {
    type: string;
    coordinates: number[];
  };
  project: string;
  user: string;
  createdAt: string;
  updatedAt: string;
};

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [projects, setProjects] = useState<ProjectData[]>([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (error) {
        setErrorMsg('Error fetching location');
      }
    })();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://192.168.2.38:5000/api/projects');
      const data = await response.json();
      console.log('Projects data:', data);
      
      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        console.error('Projects data is not an array:', data);
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Project Selection</Text>
      {location ? (
        <Text style={styles.text}>
          Location: Latitude {location.coords.latitude.toFixed(4)}, 
          Longitude {location.coords.longitude.toFixed(4)}
        </Text>
      ) : errorMsg ? (
        <Text style={styles.text}>Error: {errorMsg}</Text>
      ) : (
        <Text style={styles.text}>Fetching location...</Text>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {Array.isArray(projects) && projects.length > 0 ? (
          projects.map((project) => (
            <Panel
              key={project._id}
              panelData={{
                id: project._id,
                heading: project.name,
                subheading: {
                  type: project.type,
                  location: project.location,
                  region: project.region,
                  status: project.status,
                  completionDate: project.completionDate,
                }
              }}
            />
          ))
        ) : (
          <Text style={styles.noProjects}>No projects available</Text>
        )}
      </ScrollView>
    </View>
  );
}

const Panel = ({ panelData }: { panelData: PanelData }) => {
  const [panelReports, setPanelReports] = useState([]);

  const viewReports = () => {
    router.push('/viewreports');
  };

  return (
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
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.viewButton]}
          onPress={viewReports}
        >
          <Text style={styles.buttonText}>View Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.createButton]}
          onPress={() => router.push('/createreport')}
        >
          <Text style={styles.buttonText}>Create Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
    alignItems: "center",
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
    paddingBottom: 60,
    flexGrow: 1,
  },
  panel: {
    width: "100%",
    maxWidth: 450,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    padding: 15,
    marginBottom: 20,
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
    fontWeight: "bold",
    marginRight: 10,
    width: 130,
  },
  subheadingValue: {
    fontSize: 13,
    fontWeight: "normal",
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  viewButton: {
    paddingVertical: 12,
    backgroundColor: "#007BFF",
  },
  createButton: {
    paddingVertical: 12,
    backgroundColor: "#007BFF",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "normal",
  },
  noProjects: {
    color: "#000",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
});