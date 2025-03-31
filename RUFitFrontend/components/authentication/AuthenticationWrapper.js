import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ModalAlert from '../ui/alerts/ModalAlert';
import { handleAuthAccess } from './user_auth/UserTokenValidation';

const AuthenticationWrapper = ({ children }) => {
    const navigation = useNavigation();
    const [isAuthenticated, setIsAuthenticated] = useState(null); // Start as null for initial loading
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const handleLogout = async (config) => {
        try {
            await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
            setAlertConfig({
                title: config.alertTitle,
                message: config.alertMessage,
                onConfirm: () => {
                    setShowAlert(false);
                    navigation.navigate('LoginScreen');
                },
            });
            setIsAuthenticated(false);
            setShowAlert(true);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const [accessToken, refreshToken] = await Promise.all([
                    AsyncStorage.getItem('access_token'),
                    AsyncStorage.getItem('refresh_token'),
                ]);

                if (!accessToken || !refreshToken) {
                    await handleLogout({
                        alertTitle: 'Session Expired', 
                        alertMessage: 'Please sign in to continue.'
                    });
                    return;
                }

                /* 
                    - handleAuthAccess will determine if accessToken is valid or exp
                    - If exp, it will "handle" the expiry --> use refreshToken to fetch
                    another one
                    - If refreshToken is also exp (or some error occurs), isValid becomes false
                */
                const isValid = await handleAuthAccess(accessToken, refreshToken);
                if (!isValid) {
                    await handleLogout({
                        alertTitle: 'Session Expired', 
                        alertMessage: 'Please sign in to continue.'
                    });
                    return;
                }

                setIsAuthenticated(true);
            } catch (error) {
                console.error('Auth check failed:', error);
                await handleLogout({
                    alertTitle: 'Error', 
                    alertMessage: 'Failed to verify your session. Please log in again.'
                });
            }
        };

        checkAuthentication();
    }, []); // Removed navigation dependency

    // Show loading state while checking auth
    if (isAuthenticated === null) {
        return null; // Or return a loading spinner
    }

    return (
        <>
            {isAuthenticated ? children : null}
            <ModalAlert
                isVisible={showAlert}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={alertConfig.onConfirm}
            />
        </>
    );
};

export default AuthenticationWrapper;