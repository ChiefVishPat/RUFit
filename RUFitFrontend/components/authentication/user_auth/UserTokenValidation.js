import AsyncStorage from '@react-native-async-storage/async-storage';

export function validate(accessToken, refreshToken){
    //if (accessToken && refreshToken){return true;}
    //return false;

    // temporarily, we will return true to pass all auth checks while testing
    const checkAuthStatus = async () => {
        try {
          const value = await AsyncStorage.getItem('authenticated');
          const isAuthenticated = value !== null ? JSON.parse(value) : false;
          console.log('User authenticated:', isAuthenticated);
          return isAuthenticated;
        } catch (error) {
          console.log('Failed to fetch authentication status:', error);
          return false;
        }
      };

    return checkAuthStatus();
}

// "validate()" will check if the given access token has not expired yet
// If it has, it will use refreshToken to create updated access token
// If refreshToken does not exist or has expired, return false

function isExpired(token){}