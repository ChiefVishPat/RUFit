import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect } from 'react';
import { AuthenticatedClientHomeScreen, AuthenticatedSavedWorkoutsScreen, AuthenticatedSaveWorkoutScreen } from './components/authentication/AuthenticatedScreens';
import LoginScreen from './app/preauth/LoginScreen';
import SignupScreen from './app/preauth/signup_flow/SignupScreen';
import UserProfileSetup from './app/preauth/signup_flow/UserProfileSetup';
import PreAuthLanding from './app/preauth/preauth_landing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

const AppNavigator = ({ isAuthenticated }) => {
    console.log(`AppNavigator: ${isAuthenticated}`);
    /*
    useEffect(() => {
        const setAuthStatus = async () => {
            try {
                await AsyncStorage.setItem('authenticated', JSON.stringify(false));
                console.log('Authentication status saved successfully!');
            } catch (error) {
                console.error('Failed to save authentication status:', error);
            }
        };
        setAuthStatus();
    }, []);
    */
    return (
        <Stack.Navigator
            initialRouteName={
                isAuthenticated
                    ? 'AuthenticatedClientHomeScreen'
                    : 'PreAuthLanding'
            }>
            {/* Non-authenticated Screens */}

            <Stack.Screen
                name="PreAuthLanding"
                component={PreAuthLanding}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
                name="LoginScreen"
                component={LoginScreen}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
                name="SignupScreen"
                component={SignupScreen}
                options={{ headerShown: false, gestureEnabled: false }}
            />

            <Stack.Screen
                name="UserProfileSetup"
                component={UserProfileSetup}
                options={{ headerShown: false, gestureEnabled: false }}
            />

            {/* Authenticated Screens */}
            <Stack.Screen
                name="AuthenticatedClientHomeScreen"
                component={AuthenticatedClientHomeScreen}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
                name="AuthenticatedSavedWorkoutsScreen"
                component={AuthenticatedSavedWorkoutsScreen}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
                name="AuthenticatedSaveWorkoutScreen"
                component={AuthenticatedSaveWorkoutScreen}
                options={{ headerShown: false, gestureEnabled: false }}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;