import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const APIClient = axios.create({
    baseURL: 'http://127.0.0.1:5000',
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to optionally add access or refresh token
APIClient.interceptors.request.use(
    async (config) => {
        // Convert data to JSON if it's an object
        if (config.data && typeof config.data === 'object') {
            config.data = JSON.stringify(config.data);
        }

        const { sendAccess, sendRefresh } = config;

        if (sendAccess && sendRefresh) {
            return Promise.reject(new Error("Cannot set both sendAccess and sendRefresh to true."));
        }

        try {
            if (sendAccess) {
                console.log("access is being sent");
                const accessToken = await AsyncStorage.getItem('access_token');
                if (accessToken) {
                    config.headers.Authorization = `Bearer ${accessToken}`;
                } else {
                    console.warn('No access token found in AsyncStorage');
                    return Promise.reject(new Error('Access token not found'));
                }
            }

            if (sendRefresh) {
                const refreshToken = await AsyncStorage.getItem('refresh_token');
                if (refreshToken) {
                    config.headers.Authorization = `Bearer ${refreshToken}`;
                } else {
                    console.warn('No refresh token found in AsyncStorage');
                    return Promise.reject(new Error('Refresh token not found'));
                }
            }

            return config;
        } catch (error) {
            console.error('Token retrieval failed:', error);
            return Promise.reject(error);
        }
    },
    (error) => Promise.reject(error)
);
