import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect } from 'react';
import * as authenticated_screens from './components/authentication/AuthenticatedScreens';
import ClientIndex from './app/postauth/client/ClientIndex';
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
                isAuthenticated ? 'ClientIndex' : 'PreAuthLanding'
            }>
            {/* Non-authenticated Screens */}

            <Stack.Screen
                name="ClientIndex"
                component={ClientIndex}
                options={{ headerShown: false, gestureEnabled: false }}
            />
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
                component={authenticated_screens.AuthenticatedClientHomeScreen}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
                name="AuthenticatedSavedWorkoutsScreen"
                component={
                    authenticated_screens.AuthenticatedSavedWorkoutsScreen
                }
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
                name="AuthenticatedSaveWorkoutScreen"
                component={authenticated_screens.AuthenticatedSaveWorkoutScreen}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
                name="AuthenticatedWorkoutDetailScreen"
                component={authenticated_screens.AuthenticatedWorkoutDetailScreen}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
                name="AuthenticatedMyBodyDataScreen"
                component={authenticated_screens.AuthenticatedMyBodyDataScreen}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
                name="AuthenticatedAccountSettingsScreen"
                component={
                    authenticated_screens.AuthenticatedAccountSettingsScreen
                }
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
                name="AuthenticatedProfileSettingsScreen"
                component={
                    authenticated_screens.AuthenticatedProfileSettingsScreen
                }
                options={{ headerShown: false, gestureEnabled: false }}
            />
        </Stack.Navigator>
    );
};
//need to add stack screen for barcode and macro page
export default AppNavigator;