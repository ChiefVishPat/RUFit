import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkAuthentication } from '../authentication/user_auth/UserTokenValidation';
import { AUTHENTICATED } from '../../constants/StatusConstants';

export const APIClient = axios.create({
    baseURL: 'http://127.0.0.1:5000',
    // for testing with expo app
    // baseURL: 'http://192.168.1.50:5000',
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
                const auth_response = await checkAuthentication();
                (`api client: ${auth_response}`);
                if (auth_response === AUTHENTICATED) {

                    ("access is being sent");
                    const accessToken = await AsyncStorage.getItem('access_token');

                    if (accessToken) {
                        config.headers.Authorization = `Bearer ${accessToken}`;
                    } else {
                        console.warn('No access token found in AsyncStorage');
                        const error = new Error('Access token not found');
                        error.status = 401;
                        return Promise.reject(error);
                    }
                }
                else {
                    const error = new Error('Current user no longer authenticated');
                    error.status = 401;
                    return Promise.reject(error);
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

            ('Sending request:', config.url, config.data);
            return config;
        } catch (error) {
            console.error('Token retrieval failed:', error);
            return Promise.reject(error);
        }
    },
    (error) => Promise.reject(error)
);
