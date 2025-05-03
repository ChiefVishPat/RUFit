import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTHENTICATED, NOT_AUTHENTICATED } from '../../../constants/StatusConstants';
import { APIClient } from '../../api/APIClient';

/* 
    THIS IS THE ONLY FUNCTION THAT EXTERNAL SOURCES SHOULD REFERENCE (only one that is being exported)
    This function will either return:
      "status_constants.AUTHENTICATED" or
      "status_constants.NOT_AUTHENTICATED"
*/
const checkAuthentication = async () => {
  try {
      const [accessToken, refreshToken] = await Promise.all([
          AsyncStorage.getItem('access_token'),
          AsyncStorage.getItem('refresh_token'),
      ]);

      if (!accessToken || !refreshToken) {
          return NOT_AUTHENTICATED;
      }
      /* 
          - handleAuthAccess will determine if accessToken is valid or exp
          - If exp, it will "handle" the expiry --> use refreshToken to fetch
          another one
          - If refreshToken is also exp (or some error occurs), isValid becomes false
      */
      const isValid = await handleAuthAccess(accessToken, refreshToken);
      console.log(`checkAuthentication: ${isValid}`);
      if (!isValid) {
          return NOT_AUTHENTICATED;
      }

      return AUTHENTICATED;
  } catch (error) {
      console.error('Auth check failed:', error);
      throw error;
  }
};


/*
    Handles expired tokens and ensures continouous authentication
    by fetching new access / refresh tokens
*/
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
      return await refreshTokens();
    }
    // Access token is still valid
    return true;
  } catch (error) {
    console.error("Token validation failed:", error);
    await clearTokens();
    return false;
  }
};

/*
    Fetches new tokens
*/
const refreshTokens = async () => {
  console.log("REFRESHING TOKENS");
  try {
    const response = await APIClient.post('/auth/refresh', {}, {sendRefresh: true});

    // Store new tokens
    await AsyncStorage.multiSet([
      ['access_token', response.data.access_token],
      ['refresh_token', response.data.refresh_token]  // If your backend returns a new refresh token
    ]);
    
    return true;
  } catch (error) {
    // console.error("Token refresh failed:", error);

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

/* 
    Clears tokens for logout
*/
const clearTokens = async () => {
  await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
};

export { checkAuthentication }