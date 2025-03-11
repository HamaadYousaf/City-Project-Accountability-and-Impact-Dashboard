import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, PermissionsAndroid, Platform, ActivityIndicator, Alert } from "react-native";
import { router } from 'expo-router';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Location = {
  latitude: number;
  longitude: number;
};

type ProjectData = {
  _id: string;
  project_name: string;
  category: string;
  location: {
    type: string;
    coordinates: number[];
  };
  region: string;
  status: string;
  current_completion_date: string;

};

type PanelData = {
  id: string;
  heading: string;
  subheading: {
    type: string;
    location: {
      type: string;
      coordinates: number[];
    };
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const projectsPerPage = 6;
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMoreProjects, setHasMoreProjects] = useState<boolean>(true);
  const pageRef = useRef<number>(1);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
        setLocation(location);
        // Fetch projects once we have the location
        if (location) {
          fetchProjects(1, location.coords);
        }
      } catch (error) {
        setErrorMsg('Error fetching location');
      }
    })();
  }, []);

  const fetchProjects = async (page: number, coords?: { latitude: number; longitude: number }, isLoadMore = false) => {
    try {
      setIsLoading(true);
      
      const userCoords = coords || (location ? location.coords : null);
      
      if (!userCoords) {
        console.error('No location available for proximity search');
        setErrorMsg('Location required to find nearby projects');
        setIsLoading(false);
        return;
      }

      console.log('User coordinates:', {
        latitude: userCoords.latitude,
        longitude: userCoords.longitude
      });

      const url = new URL(`http://192.168.2.38:5000/api/projects`);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', '50'); // Increased limit to get more projects
      url.searchParams.append('lat', userCoords.latitude.toString());
      url.searchParams.append('lng', userCoords.longitude.toString());
      url.searchParams.append('radius', '10'); // Increased radius to get more potential projects
      
      console.log('API URL:', url.toString());

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      console.log('Total projects received:', responseData.data?.length || 0);

      if (responseData && Array.isArray(responseData.data)) {
        // Log all projects before filtering
        console.log('All projects before filtering:', responseData.data.map((p: ProjectData) => ({
          name: p.project_name,
          coordinates: p.location?.coordinates
        })));

        const nearbyProjects = responseData.data.filter((project: ProjectData) => {
          // Validate project data
          if (!project.location?.coordinates || 
              !Array.isArray(project.location.coordinates) || 
              project.location.coordinates.length !== 2) {
            console.log('Project with invalid coordinates:', project.project_name);
            return false;
          }

          // MongoDB stores coordinates as [longitude, latitude]
          const projectLat = project.location.coordinates[1];
          const projectLng = project.location.coordinates[0];

          if (typeof projectLat !== 'number' || typeof projectLng !== 'number') {
            console.log('Project with non-numeric coordinates:', project.project_name);
            return false;
          }

          const distance = calculateDistance(
            userCoords.latitude,
            userCoords.longitude,
            projectLat,
            projectLng
          );

          console.log(`Project "${project.project_name}" - Distance: ${distance}km`);
          
          return distance <= 5; // 5km radius
        });

        console.log('Filtered projects:', {
          total: responseData.data.length,
          nearby: nearbyProjects.length,
          projects: nearbyProjects.map((p: ProjectData) => ({
            name: p.project_name,
            distance: calculateDistance(
              userCoords.latitude,
              userCoords.longitude,
              p.location.coordinates[1],
              p.location.coordinates[0]
            )
          }))
        });

        if (isLoadMore) {
          setProjects(prevProjects => [...prevProjects, ...nearbyProjects]);
        } else {
          setProjects(nearbyProjects);
        }
        
        setHasMoreProjects(nearbyProjects.length >= projectsPerPage);
      } else {
        console.error('Invalid API response structure:', responseData);
        setErrorMsg('Error loading projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setErrorMsg('Error loading projects');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreProjects = () => {
    if (hasMoreProjects && !isLoadingMore) {
      const nextPage = currentPage + 1;
      fetchProjects(nextPage, location?.coords, true);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Projects</Text>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      {location ? (
        <View>
          <Text style={styles.text}>
            Location: Latitude {location.coords.latitude.toFixed(8)}, 
            Longitude {location.coords.longitude.toFixed(8)}
          </Text>
          <Text style={styles.radiusText}>
            Showing projects within 5 km
          </Text>
        </View>
      ) : errorMsg ? (
        <Text style={styles.text}>Error: {errorMsg}</Text>
      ) : (
        <Text style={styles.text}>Fetching location...</Text>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Loading projects...</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
              
              if (isCloseToBottom && hasMoreProjects && !isLoadingMore) {
                loadMoreProjects();
              }
            }}
            scrollEventThrottle={200}
          >
            {Array.isArray(projects) && projects.length > 0 ? (
              <>
                {projects.map((project: ProjectData, index: number) => (
                  <View key={project._id} style={styles.panel}>
                    <View style={styles.header}>
                      <Text style={styles.headerText}>{project.project_name}</Text>
                    </View>
                    <View style={styles.subheadingContainer}>
                      <Text style={styles.subheadingLabel}>Type:</Text>
                      <Text style={styles.subheadingValue}>{project.category}</Text>
                    </View>
                    <View style={styles.subheadingContainer}>
                      <Text style={styles.subheadingLabel}>Location:</Text>
                      <Text style={styles.subheadingValue}>{project.location?.coordinates?.[0]}, {project.location?.coordinates?.[1]}</Text>
                    </View>
                    <View style={styles.subheadingContainer}>
                      <Text style={styles.subheadingLabel}>Region:</Text>
                      <Text style={styles.subheadingValue}>{project.region}</Text>
                    </View>
                    <View style={styles.subheadingContainer}>
                      <Text style={styles.subheadingLabel}>Status:</Text>
                      <Text style={styles.subheadingValue}>{project.status}</Text>
                    </View>
                    <View style={styles.subheadingContainer}>
                      <Text style={styles.subheadingLabel}>Completion Date:</Text>
                      <Text style={styles.subheadingValue}>{new Date(project.current_completion_date).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity 
                        style={[styles.button, styles.viewButton]}
                        onPress={() => {
                          router.push({
                            pathname: '/viewreports',
                            params: { 
                              projectId: project._id,
                              projectName: project.project_name
                            }
                          });
                        }}
                      >
                        <Text style={styles.buttonText}>View Reports</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.button, styles.createButton]}
                        onPress={() => {
                          router.push({
                            pathname: '/createreport',
                            params: { 
                              projectId: project._id,
                              projectName: project.project_name
                            }
                          });
                        }}
                      >
                        <Text style={styles.buttonText}>Create Report</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                
                {isLoadingMore && (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="small" color="#007BFF" />
                    <Text style={styles.loadingMoreText}>Loading more projects...</Text>
                  </View>
                )}
                
                {!hasMoreProjects && projects.length > projectsPerPage && (
                  <Text style={styles.endOfListText}>
                    No more projects available
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.noProjects}>
                No projects found within 5 km of your location
              </Text>
            )}
            {hasMoreProjects && !isLoadingMore && (
              <Text style={styles.scrollIndicatorText}>
                Scroll for more projects...
              </Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    console.error('Invalid coordinates:', { lat1, lon1, lat2, lon2 });
    return Infinity;
  }

  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in km
  return Math.round(d * 100) / 100; // Round to 2 decimal places
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    color: "#000",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    flex: 1,
    fontWeight: "bold",
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
    paddingBottom: 80, // Increased to make room for pagination
  },
  panel: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    padding: 12,
    marginBottom: 15,
  },
  logoutButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
  },
  subheadingContainer: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "center",
  },
  subheadingLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginRight: 8,
    width: 100,
  },
  subheadingValue: {
    fontSize: 12,
    fontWeight: "normal",
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007BFF',
  },
  loadingMoreContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingMoreText: {
    marginTop: 10,
    fontSize: 14,
    color: '#007BFF',
  },
  endOfListText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
    fontSize: 14,
  },
  radiusText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  debugText: {
    position: 'absolute',
    top: -20,
    color: 'red',
    fontSize: 12,
  },
  scrollIndicatorText: {
    textAlign: 'center',
    padding: 10,
    color: '#007BFF',
    fontSize: 14,
  },
});