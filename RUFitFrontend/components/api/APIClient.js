import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkAuthentication } from "../authentication/user_auth/UserTokenValidation";
import { AUTHENTICATED, NOT_AUTHENTICATED } from "../../constants/StatusConstants";

export const APIClient = axios.create({
  baseURL: "http://127.0.0.1:5000",
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor to add auth token when needed
APIClient.interceptors.request.use(
  async (config) => {
    if (config.data && typeof config.data === 'object') {
      config.data = JSON.stringify(config.data);
    }

    // Check if this request requires authentication
    if (config.sendAccess) {
      try {
        const auth_response = await checkAuthentication();
        if (auth_response === AUTHENTICATED) {
          const accessToken = await AsyncStorage.getItem('access_token');
          config.headers.Authorization = `Bearer ${accessToken}`;
        } else {
          // 👇 Reject the request with a custom error
          return Promise.reject({
            isAuthError: true,  // Flag to identify auth errors
            status: 401,
            message: 'User not authenticated',
          });
        }
      } catch (error) {
        return Promise.reject({
          isAuthError: true,
          status: 500,
          message: 'Failed to validate authentication',
        });
      }
    }

    if (config.sendRefresh) {
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          config.headers.Authorization = `Bearer ${refreshToken}`;
        } else {
          return Promise.reject({
            isAuthError: true,
            status: 401,
            message: 'No refresh token found',
          });
        }
      } catch (error) {
        return Promise.reject({
          isAuthError: true,
          status: 500,
          message: 'Failed to retrieve refresh token',
        });
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);