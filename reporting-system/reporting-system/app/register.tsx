import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';

export const screenOptions = {
  headerShown: false,
};

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Validate all required fields
    if (!formData.username || !formData.first_name || !formData.last_name || 
        !formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('http://192.168.2.38:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: 'user', // Default role
          phone: formData.phone || undefined // Make phone optional
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Registration failed');
      }

      Alert.alert('Success', 'Registration successful', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Username *"
        value={formData.username}
        onChangeText={(text) => setFormData({...formData, username: text})}
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="First Name *"
        value={formData.first_name}
        onChangeText={(text) => setFormData({...formData, first_name: text})}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Last Name *"
        value={formData.last_name}
        onChangeText={(text) => setFormData({...formData, last_name: text})}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email *"
        value={formData.email}
        onChangeText={(text) => setFormData({...formData, email: text})}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Phone (optional)"
        value={formData.phone}
        onChangeText={(text) => setFormData({...formData, phone: text})}
        keyboardType="phone-pad"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password *"
        value={formData.password}
        onChangeText={(text) => setFormData({...formData, password: text})}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirm Password *"
        value={formData.confirmPassword}
        onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
        secureTextEntry
      />

      <TouchableOpacity 
        style={styles.button}
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Registering...' : 'Register'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>
          Back to Login
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e4e8',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 15,
    padding: 10,
  },
  backText: {
    color: '#007BFF',
    textAlign: 'center',
    fontSize: 16,
  },
}); 