import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, PermissionsAndroid, Platform, ActivityIndicator, Alert, TextInput } from "react-native";
import { router } from 'expo-router';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

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
  construction_start_date: string;
  original_completion_date: string;
  address: string;
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

const PREDEFINED_REGIONS = [
  "---",
  "All Regions",
  "Central",
  "Downtown",
  "East",
  "North York",
  "Peel"
];

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
  const [categoryFilter, setCategoryFilter] = useState<string>("null");
  const [regionFilter, setRegionFilter] = useState<string>("null");
  const [statusFilter, setStatusFilter] = useState<string>("null");
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [uniqueRegions, setUniqueRegions] = useState<string[]>([]);
  const [uniqueStatuses, setUniqueStatuses] = useState<string[]>([]);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(false);

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

      // Increase the limit to ensure we get all projects in one request
      const url = new URL(`http://192.168.2.38:5000/api/projects`);
      url.searchParams.append('page', '1');
      url.searchParams.append('limit', '1000');  // Increased from 50 to 1000
      url.searchParams.append('lat', userCoords.latitude.toString());
      url.searchParams.append('lng', userCoords.longitude.toString());
      url.searchParams.append('radius', '100');  // Increased from 10 to 100
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();

      if (responseData && Array.isArray(responseData.data)) {
        const allProjects = responseData.data;
        setProjects(allProjects);
        
        // Extract and set unique regions immediately
        const uniqueRegions = [...new Set(allProjects.map((p: ProjectData) => p.region))] as string[];
        console.log('Initial unique regions:', uniqueRegions);
        setUniqueRegions(uniqueRegions);
        
        // Extract other unique values
        const uniqueCategories = [...new Set(allProjects.map((p: ProjectData) => p.category))] as string[];
        const uniqueStatuses = [...new Set(allProjects.map((p: ProjectData) => p.status))] as string[];
        setUniqueCategories(uniqueCategories);
        setUniqueStatuses(uniqueStatuses);
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

  // Update the helper function to compare full names
  const compareProjectNames = (a: string, b: string) => {
    const nameA = a.trim().toLowerCase();
    const nameB = b.trim().toLowerCase();
    return nameA.localeCompare(nameB);
  };

  const filterProjects = () => {
    if (showAllProjects) {
      const allSorted = [...projects].sort((a, b) => 
        compareProjectNames(a.project_name, b.project_name)
      );
      setFilteredProjects(allSorted);
      return;
    }

    let filtered = [...projects];
    
    // Apply text search first on all projects
    if (searchQuery.trim()) {
      filtered = filtered
        .filter(project => 
          project.project_name.toLowerCase().startsWith(searchQuery.toLowerCase())
        )
        .sort((a, b) => compareProjectNames(a.project_name, b.project_name));
      setFilteredProjects(filtered);
      return;
    }
    
    // If no search query, proceed with other filters
    const shouldApplyLocationFilter = 
      categoryFilter === "null" && 
      regionFilter === "null" && 
      statusFilter === "null" &&
      location && 
      location.coords;

    if (shouldApplyLocationFilter) {
      // Apply location-based filtering
      filtered = filtered
        .filter(project => {
          if (!project.location?.coordinates || project.location.coordinates.length !== 2) {
            return false;
          }
          const [longitude, latitude] = project.location.coordinates;
          const distance = calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            latitude,
            longitude
          );
          return distance <= 5;
        })
        .sort((a, b) => compareProjectNames(a.project_name, b.project_name));
    } else {
      // Apply regular filters
      if (categoryFilter && categoryFilter !== "null") {
        filtered = filtered.filter(project => project.category === categoryFilter);
      }
      
      if (regionFilter && regionFilter !== "null") {
        console.log('Filtering by region:', regionFilter);
        console.log('Available regions:', projects.map(p => p.region));
        filtered = filtered.filter(project => {
          const matches = project.region === regionFilter;
          console.log(`Project ${project.project_name} region: "${project.region}" matches "${regionFilter}": ${matches}`);
          return matches;
        });
      }
      
      if (statusFilter && statusFilter !== "null") {
        filtered = filtered.filter(project => project.status === statusFilter);
      }
      
      // Sort alphabetically after applying filters
      filtered = filtered.sort((a, b) => compareProjectNames(a.project_name, b.project_name));
    }
    
    setFilteredProjects(filtered);
  };

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, location, categoryFilter, regionFilter, statusFilter, showAllProjects]);

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
      <View style={styles.filtersContainer}>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity 
            style={[styles.checkbox, showAllProjects && styles.checkboxChecked]}
            onPress={() => setShowAllProjects(!showAllProjects)}
          >
            {showAllProjects && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>Show all projects</Text>
          
          {isAdmin && (
            <>
              <TouchableOpacity 
                style={[styles.checkbox, showCoordinates && styles.checkboxChecked, { marginLeft: 50 }]}
                onPress={() => setShowCoordinates(!showCoordinates)}
              >
                {showCoordinates && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Show user location</Text>
            </>
          )}
        </View>
        
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Type:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={categoryFilter}
              onValueChange={(value: string) => {
                setCategoryFilter(value);
                filterProjects();
              }}
              style={styles.picker}
            >
              <Picker.Item label="---" value="null" style={{ fontSize: 14 }} />
              {uniqueCategories.map(category => (
                <Picker.Item key={category} label={category} value={category} style={{ fontSize: 14 }} />
              ))}
            </Picker>
          </View>
        </View>
        
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Region:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={regionFilter}
              onValueChange={(value: string) => {
                setRegionFilter(value);
                filterProjects();
              }}
              style={styles.picker}
            >
              <Picker.Item label="---" value="null" style={{ fontSize: 14 }} />
              {PREDEFINED_REGIONS.slice(2).map(region => (
                <Picker.Item key={region} label={region} value={region} style={{ fontSize: 14 }} />
              ))}
            </Picker>
          </View>
        </View>
        
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Status:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={statusFilter}
              onValueChange={(value: string) => {
                setStatusFilter(value);
                filterProjects();
              }}
              style={styles.picker}
            >
              <Picker.Item label="---" value="null" style={{ fontSize: 14 }} />
              {uniqueStatuses.map(status => (
                <Picker.Item key={status} label={status} value={status} style={{ fontSize: 14 }} />
              ))}
            </Picker>
          </View>
        </View>
      </View>
      {location ? (
        <View>
          {isAdmin && showCoordinates && (
            <Text style={styles.text}>
              Location: Latitude {location.coords.latitude.toFixed(8)}, Longitude {location.coords.longitude.toFixed(8)}
            </Text>
          )}
          {!showAllProjects && !searchQuery.trim() && categoryFilter === "null" && regionFilter === "null" && statusFilter === "null" && (
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
              const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
              
              if (isCloseToBottom && !isLoadingMore) {
                // Only fetch more projects when user has explicitly scrolled to bottom
                setIsLoadingMore(true);
                fetchProjects(currentPage + 1, location?.coords, true)
                  .finally(() => setIsLoadingMore(false));
              }
            }}
            scrollEventThrottle={400}  // Reduced from 200 to 400 to check less frequently
          >
            {Array.isArray(filteredProjects) && filteredProjects.length > 0 ? (
              <>
                {filteredProjects.map((project: ProjectData, index: number) => (
                  <View key={`${project._id}-${index}`} style={styles.projectCard}>
                    <Text style={styles.projectTitle}>{project.project_name}</Text>
                    <View style={styles.projectDetails}>
                      <Text style={styles.detailLabel}>Location:</Text>
                      <Text style={styles.detailText}>
                        {isAdmin && showCoordinates && project.location?.coordinates 
                          ? `[${project.location.coordinates[1]}, ${project.location.coordinates[0]}]`
                          : project.address}
                      </Text>
                    </View>
                    <View style={styles.projectDetails}>
                      <Text style={styles.detailLabel}>Type:</Text>
                      <Text style={styles.detailText}>{project.category}</Text>
                    </View>
                    <View style={styles.projectDetails}>
                      <Text style={styles.detailLabel}>Region:</Text>
                      <Text style={styles.detailText}>{project.region}</Text>
                    </View>
                    <View style={styles.projectDetails}>
                      <Text style={styles.detailLabel}>Status:</Text>
                      <Text style={styles.detailText}>{project.status}</Text>
                    </View>
                    <View style={styles.projectDetails}>
                      <Text style={styles.detailLabel}>Start Date:</Text>
                      <Text style={styles.detailText}>
                        {project.construction_start_date ? new Date(project.construction_start_date).toLocaleDateString() : 'Not set'}
                      </Text>
                    </View>
                    <View style={styles.projectDetails}>
                      <Text style={styles.detailLabel}>Original Completion:</Text>
                      <Text style={styles.detailText}>
                        {project.original_completion_date ? new Date(project.original_completion_date).toLocaleDateString() : 'Not set'}
                      </Text>
                    </View>
                    <View style={styles.projectDetails}>
                      <Text style={styles.detailLabel}>Current Completion:</Text>
                      <Text style={styles.detailText}>
                        {project.current_completion_date ? new Date(project.current_completion_date).toLocaleDateString() : 'Not set'}
                      </Text>
                    </View>
                    <View style={styles.buttonRow}>
                      <TouchableOpacity 
                        style={styles.viewButton}
                        onPress={async () => {
                          // Double-check role before navigation
                          const userData = await AsyncStorage.getItem('userData');
                          if (!userData) {
                            router.replace('/');
                            return;
                          }

                          const { role } = JSON.parse(userData);
                          console.log('Navigating with role:', role);

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
                        style={[styles.viewButton, styles.createButton]}
                        onPress={() => router.push({
                          pathname: '/createreport',
                          params: { 
                            projectId: project._id,
                            projectName: project.project_name
                          }
                        })}
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
                {categoryFilter === "null" && regionFilter === "null" && statusFilter === "null" && location
                  ? "No projects found within 5 km"
                  : "No projects found"}
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
    fontSize: 28,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: "center",
    marginBottom: 25,
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
  projectCard: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e1e4e8",
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 8,
  },
  projectDetails: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 8,
    width: 100,
    color: '#333',
  },
  detailText: {
    fontSize: 12,
    fontWeight: "normal",
    flex: 1,
  },
  logoutButton: {
    position: 'absolute',
    left: 20,
    top: 15,
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewButton: {
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
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
    backgroundColor: '#f8f9fa',
    height: 40,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  createButton: {
    backgroundColor: "#007BFF",
  },
  filtersContainer: {
    marginVertical: 20,
    paddingHorizontal: 20,
    width: '100%',
    alignSelf: 'center',
  },
  filterItem: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 35,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    width: '30%',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    width: '68%',
    height: 35,
  },
  picker: {
    width: '100%',
    color: '#000',
    marginTop: -8,
    marginLeft: -8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: -15,
    marginLeft: 0,
    paddingLeft: 0,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007BFF',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
});