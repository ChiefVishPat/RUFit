import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const APIClient = axios.create({
    baseURL: 'http://127.0.0.1:5000',
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to always add the auth token (if present)
APIClient.interceptors.request.use(
    async (config) => {
        // Convert data to JSON if it's an object
        if (config.data && typeof config.data === 'object') {
            config.data = JSON.stringify(config.data);
        }

        try {
            const accessToken = await AsyncStorage.getItem('access_token');
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            } else {
                console.warn('No access token found in AsyncStorage');
                return Promise.reject(error);
            }
        } catch (error) {
            console.error('Failed to retrieve access token:', error);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
