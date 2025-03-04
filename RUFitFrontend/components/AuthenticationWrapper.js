import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validate } from './UserTokenValidation';

const AuthenticationWrapper = ({ children }) => {
    const navigation = useNavigation();

    useEffect(() => {
        const checkAuthentication = async () => {
            const accessToken = await AsyncStorage.getItem('accessToken');
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (!validate(accessToken, refreshToken)) {
                // Redirect to login if not authenticated
                // There should be more custom logic here, such as informing the user
                // with a pop-up that they have been logged out.
                navigation.navigate('LoginScreen');
            }
        };

        checkAuthentication();
    }, [navigation]);

    // Render the children (the actual screen) if authenticated
    return children;
};

export default AuthenticationWrapper;