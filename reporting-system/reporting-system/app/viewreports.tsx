import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

type Comment = {
  _id: string;
  body: string;
  createdAt: string;
  user: string;
  report: string;
};

type Report = {
  _id: string;
  title: string;
  body: string;
  image?: string;
  location: {
    type: string;
    coordinates: number[];
  };
  createdAt: string;
  project: string;
  showComments?: boolean; // Added to track comment visibility
};

export default function ViewReports() {
  const { projectId, projectName } = useLocalSearchParams();
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});

  const fetchReports = async () => {
    if (!projectId) return;
    
    try {
      const projectIdString = String(projectId);
      const url = `http://192.168.2.38:5000/api/reports?project=${encodeURIComponent(projectIdString)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      const filteredReports = responseData.data?.filter(
        (report: Report) => report.project === projectIdString
      ) || [];
      
      setReports(filteredReports);
      if (filteredReports.length === 0) {
        setError("No reports found for this project");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to fetch reports: ${errorMessage}`);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    Alert.alert(
      "Delete Report",
      "Are you sure you want to delete this report?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`http://192.168.2.38:5000/api/reports?id=${reportId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                }
              });

              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete report: ${response.status}\n${errorText}`);
              }

              // Refresh reports list after deletion
              fetchReports();
              Alert.alert("Success", "Report deleted successfully");
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
              Alert.alert("Error", `Failed to delete report: ${errorMessage}`);
            }
          }
        }
      ]
    );
  };

  const toggleComments = async (reportId: string) => {
    const updatedReports = reports.map(report => {
      if (report._id === reportId) {
        if (!report.showComments) {
          // Fetch comments when expanding
          fetchComments(reportId);
        }
        return { ...report, showComments: !report.showComments };
      }
      return report;
    });
    setReports(updatedReports);
  };

  const fetchComments = async (reportId: string) => {
    try {
      // Add console.log to debug
      console.log('Fetching comments for report:', reportId);
      
      const response = await fetch(`http://192.168.2.38:5000/api/comments?report=${reportId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await response.json();
      console.log('Received comments:', data);
      
      // Make sure we're only storing comments for this specific report
      const filteredComments = data.data?.filter(
        (comment: Comment) => comment.report === reportId
      ) || [];
      
      console.log('Filtered comments:', filteredComments);
      
      setComments(prev => ({ 
        ...prev, 
        [reportId]: filteredComments 
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleDeleteComment = async (commentId: string, reportId: string) => {
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`http://192.168.2.38:5000/api/comments?id=${commentId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                }
              });

              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete comment: ${response.status}\n${errorText}`);
              }

              // Refresh comments for this report
              fetchComments(reportId);
              Alert.alert("Success", "Comment deleted successfully");
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
              Alert.alert("Error", `Failed to delete comment: ${errorMessage}`);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchReports();
  }, [projectId]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Reports for {projectName}</Text>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : reports.length === 0 ? (
        <Text style={styles.noReports}>No reports available for this project</Text>
      ) : (
        reports.map((report, index) => (
          <View key={index} style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <Text style={styles.reportTitle}>{report.title}</Text>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteReport(report._id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.reportBody}>{report.body}</Text>
            {report.image && (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: report.image }} 
                  style={styles.reportImage}
                  resizeMode="cover"
                />
              </View>
            )}
            <Text style={styles.reportDate}>
              Created: {new Date(report.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.reportLocation}>
              Location: {report.location.coordinates.join(', ')}
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.commentButton}
                onPress={() => router.push({
                  pathname: '/addcomment',
                  params: { reportId: report._id, projectId, projectName }
                })}
              >
                <Text style={styles.commentButtonText}>Add a Comment</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.viewCommentsButton}
                onPress={() => toggleComments(report._id)}
              >
                <Text style={styles.commentButtonText}>
                  {report.showComments ? 'Hide Comments' : 'View Comments'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {report.showComments && (
              <View style={styles.commentsSection}>
                <Text style={styles.commentsSectionTitle}>Comments</Text>
                {comments[report._id]?.length > 0 ? (
                  comments[report._id].map((comment, idx) => (
                    <View key={idx} style={styles.commentItem}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentText}>{comment.body}</Text>
                        <TouchableOpacity 
                          style={styles.deleteCommentButton}
                          onPress={() => handleDeleteComment(comment._id, report._id)}
                        >
                          <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.commentDate}>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noComments}>No comments yet</Text>
                )}
              </View>
            )}
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
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  reportLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  commentButton: {
    backgroundColor: '#007BFF',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    width: 120,
  },
  commentButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 6,
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  viewCommentsButton: {
    backgroundColor: '#007BFF',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    width: 120,
  },
  commentsSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  commentsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  commentItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
  },
  commentDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  noComments: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  deleteCommentButton: {
    backgroundColor: '#dc3545',
    padding: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  imageContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  reportImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
}); 