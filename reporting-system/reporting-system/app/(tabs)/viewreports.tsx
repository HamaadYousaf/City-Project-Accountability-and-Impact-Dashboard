import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

type Report = {
  title: string;
  body: string;
  location: {
    type: string;
    coordinates: number[];
  };
  createdAt: string;
};

export default function ViewReports() {
  const { projectId, projectName } = useLocalSearchParams();
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`http://192.168.2.38:5000/api/reports?project=${projectId}`);
        const data = await response.json();
        
        // Check if data is an array
        if (Array.isArray(data)) {
          setReports(data);
        } else {
          setReports([]);
          setError("No reports found");
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
        setError("Failed to fetch reports");
      }
    };

    fetchReports();
  }, [projectId]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Reports for {projectName}</Text>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : reports.length === 0 ? (
        <Text style={styles.noReports}>No reports available</Text>
      ) : (
        reports.map((report, index) => (
          <View key={index} style={styles.reportCard}>
            <Text style={styles.reportTitle}>{report.title}</Text>
            <Text style={styles.reportBody}>{report.body}</Text>
            <Text style={styles.reportDate}>
              Created: {new Date(report.createdAt).toLocaleDateString()}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
  },
  reportCard: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reportBody: {
    fontSize: 16,
    marginBottom: 10,
  },
  reportDate: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
  },
  noReports: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
}); 