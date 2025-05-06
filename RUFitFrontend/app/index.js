import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStackNavigator } from '@react-navigation/stack';
import AppNavigator from '../AppNavigator';
import { handleAuthAccess } from '../components/authentication/user_auth/UserTokenValidation';
import { AppRegistry } from 'react-native';
import App from '../App'; // Import the App component
import { name as appName } from '../app.json';

// Register the App component with the AppRegistry
AppRegistry.registerComponent(appName, () => App);

const Stack = createStackNavigator();

/**
 * AppWrapper is responsible for checking user authentication status
 * and rendering AppNavigator with appropriate authentication state.
 */
const AppWrapper = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // initially false before token validation

  // Axios instance (unused here, but retained if needed elsewhere)
  const apiClient = axios.create({
    baseURL: "http://127.0.0.1:5000",
    headers: { 'Content-Type': 'application/json' }
  });

  // Validate tokens on component mount
  useEffect(() => {
    const checkToken = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('access_token');
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        (accessToken);
        (refreshToken);

        if (await handleAuthAccess(accessToken, refreshToken)) {
          ("index.js is setting auth to true");
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Failed to fetch token:', error);
      } finally {
        setIsLoading(false);
      }

      (`index.js: ${isAuthenticated}`);
    };

    checkToken();
  }, []);

  // Show loading spinner while validating token
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Render AppNavigator with auth state
  return (
    <AppNavigator isAuthenticated={isAuthenticated} />
  );
};

export default AppWrapper;
