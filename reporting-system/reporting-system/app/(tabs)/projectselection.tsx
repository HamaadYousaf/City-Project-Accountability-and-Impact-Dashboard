import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, PermissionsAndroid, Platform, ActivityIndicator, Alert, TextInput } from "react-native";
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredProjects, setFilteredProjects] = useState<ProjectData[]>([]);
  const [totalProjects, setTotalProjects] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (!userData) {
          router.replace('/');
          return;
        }
        // Add expiry check if you have token expiration
        const parsedData = JSON.parse(userData);
        if (parsedData.expiresAt && new Date(parsedData.expiresAt) < new Date()) {
          await AsyncStorage.removeItem('userData');
          router.replace('/');
          return;
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.replace('/');
      }
    };

    checkAuth();
    
    // Set up an interval to periodically check authentication
    const authCheckInterval = setInterval(checkAuth, 60000); // Check every minute
    
    return () => {
      clearInterval(authCheckInterval);
    };
  }, []);

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

      const url = new URL(`http://192.168.2.38:5000/api/projects`);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', '50');
      url.searchParams.append('lat', userCoords.latitude.toString());
      url.searchParams.append('lng', userCoords.longitude.toString());
      url.searchParams.append('radius', '10');
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();

      if (responseData && Array.isArray(responseData.data)) {
        if (isLoadMore) {
          setProjects(prevProjects => [...prevProjects, ...responseData.data]);
        } else {
          setProjects(responseData.data);
        }
        // Only set hasMoreProjects to true if we received the full page of results
        setHasMoreProjects(responseData.data.length >= 50); // 50 is the limit we're requesting
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
      router.replace('/');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out');
    }
  };

  const filterAndSortProjects = (projects: ProjectData[], query: string, userCoords: { latitude: number; longitude: number } | null) => {
    let filteredProjects = [...projects];
    
    // Filter by search query if one exists
    if (query.trim()) {
      filteredProjects = projects.filter(project => 
        project.project_name.toLowerCase().startsWith(query.toLowerCase())
      );
    }
    // If no search query, filter by distance
    else if (userCoords) {
      filteredProjects = projects.filter((project: ProjectData) => {
        if (!project.location?.coordinates || 
            !Array.isArray(project.location.coordinates) || 
            project.location.coordinates.length !== 2) {
          return false;
        }

        const projectLat = project.location.coordinates[1];
        const projectLng = project.location.coordinates[0];

        if (typeof projectLat !== 'number' || typeof projectLng !== 'number') {
          return false;
        }

        const distance = calculateDistance(
          userCoords.latitude,
          userCoords.longitude,
          projectLat,
          projectLng
        );
        
        return distance <= 5; // 5km radius
      });
    }

    // Always sort alphabetically
    return filteredProjects.sort((a, b) => a.project_name.localeCompare(b.project_name));
  };

  useEffect(() => {
    const userCoords = location?.coords || null;
    const filtered = filterAndSortProjects(projects, searchQuery, userCoords);
    setFilteredProjects(filtered);
  }, [projects, searchQuery, location]);

  const [debouncedSearchQuery] = useState(() => {
    let timeoutId: NodeJS.Timeout;
    return (value: string) => {
      clearTimeout(timeoutId);
      setSearchQuery(value); // Update search query immediately
      timeoutId = setTimeout(() => {
        setCurrentPage(1);
        if (location) {
          fetchProjects(1, location.coords);
        }
      }, 500);
    };
  });

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (!userData) {
          router.replace('/');
          return;
        }
        
        const { role } = JSON.parse(userData);
        console.log('Current user role:', role); // Debug log
        
        // Set both states
        setUserRole(role);
        setIsAdmin(role === 'admin');
      } catch (error) {
        console.error('Error checking user role:', error);
        router.replace('/');
      }
    };
    
    checkUserRole();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Projects</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search all projects..."
          onChangeText={debouncedSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>
      {location ? (
        <View>
          <Text style={styles.text}>
            Location: Latitude {location.coords.latitude.toFixed(8)}, 
            Longitude {location.coords.longitude.toFixed(8)}
          </Text>
          {!searchQuery.trim() && (
            <Text style={styles.radiusText}>
              Showing projects within 5 km
            </Text>
          )}
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
            {Array.isArray(filteredProjects) && filteredProjects.length > 0 ? (
              <>
                {filteredProjects.map((project: ProjectData, index: number) => (
                  <View key={`${project._id}-${index}`} style={styles.panel}>
                    <View style={styles.panelHeader}>
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
                        onPress={async () => {
                          // Double-check role before navigation
                          const userData = await AsyncStorage.getItem('userData');
                          if (!userData) {
                            router.replace('/');
                            return;
                          }

                          const { role } = JSON.parse(userData);
                          console.log('Navigating with role:', role); // Debug log

                          // Strict routing based on role
                          if (role === 'admin') {
                            router.push({
                              pathname: '/viewreports',
                              params: { 
                                projectId: project._id,
                                projectName: project.project_name
                              }
                            });
                          } else {
                            router.push({
                              pathname: '/viewreportsuser',
                              params: { 
                                projectId: project._id,
                                projectName: project.project_name
                              }
                            });
                          }
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
              </>
            ) : (
              <Text style={styles.noProjects}>
                {searchQuery 
                  ? "No projects found matching your search"
                  : "No projects found within 5 km of your location"}
              </Text>
            )}
            {hasMoreProjects && !isLoadingMore && filteredProjects.length > 0 && projects.length < totalProjects && (
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 20,
    position: 'relative',
    marginTop: 20,
  },
  title: {
    color: "#000",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
    marginTop: 10,
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
    left: 20,
    top: 15,
    backgroundColor: '#dc3545',
    padding: 6,
    borderRadius: 5,
    zIndex: 1,
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "left",
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
});