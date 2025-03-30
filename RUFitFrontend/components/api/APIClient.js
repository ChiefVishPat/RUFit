import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const APIClient = axios.create({
  baseURL: "http://127.0.0.1:5000",
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor to add auth token when needed
APIClient.interceptors.request.use(
  async (config) => {
    
    // convert data in JSON object
    if (config.data && typeof config.data === 'object') {
      config.data = JSON.stringify(config.data);
    }

    // Check if this request requires authentication
    if (config.sendAccess) {
      try {
        const accessToken = await AsyncStorage.getItem('access_token');
        
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        } else {
          console.warn('No access token found in AsyncStorage');
        }
      } catch (error) {
        console.error('Failed to retrieve access token:', error);
      }
    }

    if (config.sendRefresh) {
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        
        if (refreshToken) {
          config.headers.Authorization = `Bearer ${refreshToken}`;
        } else {
          console.warn('No refresh token found in AsyncStorage');
        }
      } catch (error) {
        console.error('Failed to retrieve refresh token:', error);
      }
    }

    /*
    console.log('Outgoing Request:', {
      url: `${config.baseURL}${config.url}`,
      method: config.method?.toUpperCase(),
      headers: config.headers,
      data: config.data,
    });
     */
    

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);