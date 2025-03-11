// app/(tabs)/login.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('http://192.168.2.38:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const loginData = await response.json();
      console.log('Login response:', loginData);

      if (!response.ok) {
        throw new Error(loginData.msg || 'Login failed');
      }

      // Store user data with role based on email
      const isAdmin = email.toLowerCase() === 'samjrajan@outlook.com'; // Your admin email
      console.log('Setting user role:', isAdmin ? 'admin' : 'user');
      await AsyncStorage.setItem('userData', JSON.stringify({
        id: loginData.user.id,
        email: loginData.user.email,
        role: isAdmin ? 'admin' : 'user'
      }));

      const storedData = await AsyncStorage.getItem('userData');
      console.log('Stored user data:', storedData);

      router.replace('/projectselection');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Error', error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const goToRegister = () => {
    router.push('../register');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity 
        style={styles.button}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.registerButton}
        onPress={goToRegister}
      >
        <Text style={styles.registerText}>
          Don't have an account? Register
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 15,
    padding: 10,
  },
  registerText: {
    color: '#007BFF',
    textAlign: 'center',
  },
});
