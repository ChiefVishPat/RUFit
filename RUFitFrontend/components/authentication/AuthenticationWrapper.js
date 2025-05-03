import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ModalAlert from '../ui/alerts/ModalAlert';
import { NOT_AUTHENTICATED } from "../../constants/StatusConstants"
import { checkAuthentication } from './user_auth/UserTokenValidation';

const AuthenticationWrapper = ({ children }) => {
    const navigation = useNavigation();
    const [isAuthenticated, setIsAuthenticated] = useState(null); // Start as null for initial loading
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => { },
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
        const checkAuth = async() => {
            try {
                const auth_response = await checkAuthentication();
                if (auth_response == NOT_AUTHENTICATED) {
                    await handleLogout({
                        alertTitle: 'Session Expired',
                        alertMessage: 'Please sign in to continue.'
                    });
                }
                else{
                    setIsAuthenticated(true);
                }
            }
            catch(error){
                console.error(error);
                await handleLogout({
                    alertTitle: 'Error', 
                    alertMessage: 'Failed to verify your session. Please log in again.'
                });
            }
        }
        checkAuth();
    }, []);

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