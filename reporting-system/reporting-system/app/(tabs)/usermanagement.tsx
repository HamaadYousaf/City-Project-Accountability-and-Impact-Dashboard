import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEV_API_URL } from '../../constants';

type User = {
  _id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
    fetchUsers();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        router.replace('/');
        return;
      }
      const { role } = JSON.parse(userData);
      if (role !== 'admin') {
        router.replace('/projectselection');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.replace('/');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${DEV_API_URL}/api/users`);
      const data = await response.json();
      if (data && Array.isArray(data.data)) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this user? All their reports and comments will also be deleted.",
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete all reports by this user
              const reportsResponse = await fetch(`${DEV_API_URL}/api/reports/user/${userId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json'
                }
              });

              if (!reportsResponse.ok) {
                throw new Error('Failed to delete user reports.');
              }

              // Delete all comments by this user
              const commentsResponse = await fetch(`${DEV_API_URL}/api/comments/user/${userId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json'
                }
              });

              if (!commentsResponse.ok) {
                throw new Error('Failed to delete user comments.');
              }

              // Finally delete the user
              const userResponse = await fetch(`${DEV_API_URL}/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json'
                }
              });

              if (!userResponse.ok) {
                const errorData = await userResponse.text();
                console.error('Delete error response:', errorData);
                throw new Error('Failed to delete user.');
              }

              setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
              Alert.alert('Success', 'User and all their content deleted successfully.');
              fetchUsers();
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Management</Text>
      <ScrollView style={styles.userList}>
        {users.map((user) => (
          <View key={user._id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user.first_name} {user.last_name}
              </Text>
              <Text style={styles.userDetail}>Username: {user.username}</Text>
              <Text style={styles.userDetail}>Email: {user.email}</Text>
              <Text style={styles.userDetail}>Role: {user.role}</Text>
              {user.phone && (
                <Text style={styles.userDetail}>Phone: {user.phone}</Text>
              )}
            </View>
            {user.role !== 'admin' && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteUser(user._id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  userList: {
    flex: 1,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 