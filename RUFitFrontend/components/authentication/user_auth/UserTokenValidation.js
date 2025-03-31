import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIClient } from '../../api/APIClient';

export const handleAuthAccess = async (accessToken, refreshToken ) => {
  //console.log(`UserTokenValidation: ${accessToken}`);
  //console.log(`UserTokenValidation: ${refreshToken}`);
  if (!accessToken || !refreshToken) {
    console.warn('Tokens missing - forcing logout');
    //await clearTokens();
    return false;
  }

  try {
    // Check if access token is expired
    const validationResponse = await APIClient.post('/auth/is-token-expired', { 
      access_token: accessToken  // Consistent with your backend endpoint
    }); 
    
    if (validationResponse.data.expired) {
      // Attempt to refresh tokens
      return await refreshTokens(refreshToken);
    }
    // Access token is still valid
    return true;
  } catch (error) {
    console.error("Token validation failed:", error);
    await clearTokens();
    throw error;
  }
};

const refreshTokens = async (refreshToken) => {
  try {
    const response = await APIClient.post('/auth/refresh', {}, {sendRefresh:true});

    // Store new tokens
    await AsyncStorage.multiSet([
      ['access_token', response.data.access_token],
      ['refresh_token', response.data.refresh_token]  // If your backend returns a new refresh token
    ]);
    
    return true;
  } catch (error) {
    console.error("Token refresh failed:", error);

    if (error.response?.status === 401) {
      // Refresh token expired or invalid
      if (error.response.data.msg){
        console.error(error.response.data.msg);
      }
      else if (error.response.data.message){
        console.error(error.response.data.message);
      }
      await clearTokens();
    }
    
    return false;
  }
};

const clearTokens = async () => {
  await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
};