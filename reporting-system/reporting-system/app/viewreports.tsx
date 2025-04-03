import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Modal, Dimensions, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { DEV_API_URL } from '../constants';

type Comment = {
  _id: string;
  body: string;
  image?: string;
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
  status?: 'pending' | 'approved' | 'rejected';
  approved?: boolean;
  showComments?: boolean;
  user: string;
};

export default function ViewReports() {
  const { projectId, projectName } = useLocalSearchParams();
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string>("");
  const [userRole, setUserRole] = useState<string>('');
  const router = useRouter();
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [usernames, setUsernames] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const getUserRole = async () => {
      const userData = await AsyncStorage.getItem('userData');
      console.log('ViewReports - Raw userData:', userData);
      if (userData) {
        const parsed = JSON.parse(userData);
        console.log('ViewReports - Parsed userData:', parsed);
        console.log('ViewReports - User role:', parsed.role);
        setUserRole(parsed.role);
      }
    };
    getUserRole();
  }, []);

  const fetchUsernames = async (reports: Report[]) => {
    try {
      const response = await fetch('http://192.168.2.38:5000/api/users');
      const data = await response.json();
      console.log('Users data:', data.data);
      
      const usernameMap = data.data.reduce((acc: { [key: string]: string }, user: any) => {
        console.log('Adding user to map:', user._id, user.username);
        acc[user._id] = user.username;
        return acc;
      }, {});
      
      console.log('Final username map:', usernameMap);
      setUsernames(usernameMap);
    } catch (error) {
      console.error('Error fetching usernames:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch(`${DEV_API_URL}/api/reports/project/admin/${projectId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      if (data && Array.isArray(data.data)) {
        const sortedReports = data.data
          .sort((a: Report, b: Report) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        setReports(sortedReports);
        await fetchUsernames(sortedReports);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
      Alert.alert('Error', 'Failed to load reports');
    }
  };

  const handleApproval = async (reportId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`http://192.168.2.38:5000/api/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approved: true  // Simply update the approved field
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Approval error response:', errorData);
        throw new Error(`Failed to approve report`);
      }

      // Update local state
      setReports(prevReports => 
        prevReports.map(report => 
          report._id === reportId 
            ? { ...report, status: 'approved', approved: true }
            : report
        )
      );

      Alert.alert('Success', 'Report approved successfully');
    } catch (error) {
      console.error('Approval error:', error);
      Alert.alert('Error', 'Failed to approve report');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    Alert.alert(
      "Delete Report",
      "Are you sure you want to delete this report? This action cannot be undone.",
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
              const response = await fetch(`http://192.168.2.38:5000/api/reports/${reportId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                }
              });

              if (!response.ok) {
                // Try to parse as JSON first
                const contentType = response.headers.get("content-type");
                let errorMessage = '';
                
                if (contentType && contentType.includes("application/json")) {
                  const errorData = await response.json();
                  errorMessage = errorData.message || 'Failed to delete report';
                } else {
                  // If not JSON, get the text response
                  errorMessage = await response.text();
                }
                
                throw new Error(errorMessage);
              }

              // Remove the deleted report from the state
              setReports(prevReports => prevReports.filter(report => report._id !== reportId));
              Alert.alert("Success", "Report deleted successfully");
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
              Alert.alert("Error", `Failed to delete report: ${errorMessage}`);
              console.error('Delete report error:', error);
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
      console.log('Fetching comments for report:', reportId);
      
      const response = await fetch(`http://192.168.2.38:5000/api/comments?report=${reportId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await response.json();
      console.log('Received comments:', data);
      
      // Get all unique user IDs from comments
      const commentUserIds = [...new Set(data.data.map((comment: Comment) => comment.user))];
      
      // Fetch users data for these comments
      const usersResponse = await fetch('http://192.168.2.38:5000/api/users');
      const usersData = await usersResponse.json();
      
      // Update username map with any new users
      const newUsernameMap = { ...usernames };
      usersData.data.forEach((user: any) => {
        newUsernameMap[user._id] = user.username;
      });
      setUsernames(newUsernameMap);
      
      // Filter and set comments
      const filteredComments = data.data?.filter(
        (comment: Comment) => comment.report === reportId
      ) || [];
      
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
              // Update URL to match backend route structure
              const response = await fetch(`http://192.168.2.38:5000/api/comments/${commentId}`, {
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

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <Text style={styles.title}>Reports for {projectName}</Text>
      {reports.map((report, index) => (
        <View key={index} style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={[styles.reportAuthor, { marginTop: 4 }]}>by {usernames[report.user] || 'unknown'}</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={[styles.statusBadge, report.approved ? styles.statusApproved : styles.statusPending]}>
                {report.approved ? 'APPROVED' : 'PENDING'}
              </Text>
              <View style={styles.headerButtons}>
                {!report.approved && (
                  <TouchableOpacity 
                    style={[styles.headerButton, styles.approveButton]}
                    onPress={() => handleApproval(report._id, 'approve')}
                  >
                    <Text style={styles.buttonText}>Approve</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={[styles.headerButton, styles.deleteButton]}
                  onPress={() => handleDeleteReport(report._id)}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {report.image && (
            <TouchableOpacity 
              style={styles.imageContainer}
              onPress={() => setSelectedImage(report.image || null)}
            >
              <Image 
                source={{ uri: report.image }} 
                style={styles.reportImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          
          <Text style={styles.reportBody}>{report.body}</Text>
          
          <Text style={styles.reportDate}>
            Created: {new Date(report.createdAt).toLocaleDateString()}
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
                      <Text style={styles.commentAuthor}>{usernames[comment.user] || 'Unknown'}</Text>
                      <TouchableOpacity 
                        style={styles.deleteCommentButton}
                        onPress={() => handleDeleteComment(comment._id, report._id)}
                      >
                        <Text style={styles.buttonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                    {comment.image && (
                      <View style={styles.commentImageContainer}>
                        <TouchableOpacity onPress={() => setSelectedImage(comment.image as string)}>
                          <Image 
                            source={{ uri: comment.image }} 
                            style={styles.commentImage}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                    <Text style={styles.commentText}>{comment.body}</Text>
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
      ))}

      <Modal
        visible={!!selectedImage}
        transparent={true}
        onRequestClose={() => setSelectedImage(null)}
        statusBarTranslucent={true}
      >
        <SafeAreaView style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setSelectedImage(null)}
          >
            <Image
              source={{ uri: selectedImage || '' }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
  },
  reportCard: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reportAuthor: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusApproved: {
    backgroundColor: '#28a745',
    color: '#fff',
  },
  statusRejected: {
    backgroundColor: '#dc3545',
    color: '#fff',
  },
  statusPending: {
    backgroundColor: '#ffc107',
    color: '#000',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  approveButton: {
    backgroundColor: '#28a745',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imageContainer: {
    marginVertical: 10,
    alignItems: 'center',
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  reportImage: {
    width: '100%',
    height: '100%',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
  commentImageContainer: {
    marginVertical: 8,
    width: '100%',
    height: 200,
  },
  commentImage: {
    width: '100%',
    height: '100%',
  },
  commentAuthor: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}); 