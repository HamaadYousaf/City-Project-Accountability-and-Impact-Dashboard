import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, PermissionsAndroid, Platform, ActivityIndicator } from "react-native";
import { router } from 'expo-router';
import * as Location from 'expo-location';

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
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchRadius, setSearchRadius] = useState<number>(5); // 5 kilometers radius
  const projectsPerPage = 6;
  const [allProjects, setAllProjects] = useState<ProjectData[]>([]);
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
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      
      // If no coordinates are provided, try to use the current location
      const userCoords = coords || (location ? location.coords : null);
      
      if (!userCoords) {
        console.error('No location available for proximity search');
        setErrorMsg('Location required to find nearby projects');
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }
      
      console.log(`Fetching projects for page ${page} within ${searchRadius}km of location:`, userCoords);
      
      // Build URL with pagination and location parameters
      const url = new URL(`http://192.168.2.38:5000/api/projects`);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', projectsPerPage.toString());
      url.searchParams.append('lat', userCoords.latitude.toString());
      url.searchParams.append('lng', userCoords.longitude.toString());
      url.searchParams.append('radius', searchRadius.toString());
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Raw API response:', responseData);
      
      if (responseData && Array.isArray(responseData.data)) {
        const newProjects = responseData.data;
        console.log(`Found ${newProjects.length} projects for page ${page}`);
        
        // If we received fewer projects than the limit, we've reached the end
        if (newProjects.length < projectsPerPage) {
          setHasMoreProjects(false);
        }
        
        if (isLoadMore) {
          // Append new projects to existing ones
          setProjects(prevProjects => [...prevProjects, ...newProjects]);
        } else {
          // Replace projects with new ones
          setProjects(newProjects);
        }
        
        // Update current page
        setCurrentPage(page);
        pageRef.current = page;
      } else {
        console.error('Invalid data format:', responseData);
        if (!isLoadMore) {
          setProjects([]);
        }
        setHasMoreProjects(false);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      if (!isLoadMore) {
        setProjects([]);
      }
      setHasMoreProjects(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (location) {
      // Reset pagination when search radius changes
      if (pageRef.current !== 1) {
        pageRef.current = 1;
        setCurrentPage(1);
      }
      fetchProjects(1, location.coords);
    }
  }, [location, searchRadius]);

  const loadMoreProjects = () => {
    if (hasMoreProjects && !isLoadingMore) {
      const nextPage = currentPage + 1;
      fetchProjects(nextPage, location?.coords, true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Projects</Text>
      {location ? (
        <View>
          <Text style={styles.text}>
            Location: Latitude {location.coords.latitude.toFixed(8)}, 
            Longitude {location.coords.longitude.toFixed(8)}
          </Text>
          <Text style={styles.radiusText}>
            Showing projects within {searchRadius} km
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
                {projects.map((project) => (
                  <Panel
                    key={project._id}
                    location={location}
                    panelData={{
                      id: project._id,
                      heading: project.project_name,
                      subheading: {
                        type: project.category,
                        location: project.location,
                        region: project.region,
                        status: project.status,
                        completionDate: new Date(project.current_completion_date).toLocaleDateString()
                      }
                    }}
                  />
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
                No projects found within {searchRadius} km of your location
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

const Panel = ({ panelData, location }: { panelData: PanelData; location: Location.LocationObject | null }) => {
  const [panelReports, setPanelReports] = useState([]);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (location && panelData.subheading.location.coordinates) {
      const dist = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        panelData.subheading.location.coordinates[1],
        panelData.subheading.location.coordinates[0]
      );
      setDistance(dist);
    }
  }, [location, panelData.subheading.location]);

  // Convert location object to string if it's an object
  const formatLocation = (location: any) => {
    if (typeof location === 'object' && location !== null) {
      return `${location.coordinates?.[0]}, ${location.coordinates?.[1]}`;
    }
    return location?.toString() || 'N/A';
  };

  const viewReports = () => {
    router.push({
      pathname: '/viewreports',
      params: { 
        projectId: panelData.id,
        projectName: panelData.heading
      }
    });
  };

  const createReport = () => {
    router.push({
      pathname: '/createreport',
      params: { 
        projectId: panelData.id,
        projectName: panelData.heading
      }
    });
  };

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View style={styles.circle} />
        <Text style={styles.headerText}>
          {panelData.heading}
        </Text>
        {distance !== null && (
          <Text style={styles.distanceText}>
            {distance.toFixed(1)} km away
          </Text>
        )}
      </View>
      <View style={styles.subheadingContainer}>
        <Text style={styles.subheadingLabel}>Type:</Text>
        <Text style={styles.subheadingValue}>{panelData.subheading.type}</Text>
      </View>
      <View style={styles.subheadingContainer}>
        <Text style={styles.subheadingLabel}>Location:</Text>
        <Text style={styles.subheadingValue}>{formatLocation(panelData.subheading.location)}</Text>
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
          onPress={createReport}
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
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
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
    fontSize: 14,
    fontWeight: "bold",
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
  distanceText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 'auto',
  },
});