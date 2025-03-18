import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthenticatedClientHomeScreen } from './components/authentication/AuthenticatedScreens';
import LoginScreen from './app/preauth/LoginScreen';
import SignupScreen from './app/preauth/signup_flow/SignupScreen';
import UserProfileSetup from './app/preauth/signup_flow/UserProfileSetup';
import PreAuthLanding from './app/preauth/preauth_landing';

const Stack = createStackNavigator();

const AppNavigator = ({ isAuthenticated }) => {
    return (
        <Stack.Navigator initialRouteName={isAuthenticated ? 'AuthenticatedClientHomeScreen' : 'PreAuthLanding'}>
            {/* Non-authenticated Screens */}
            <Stack.Screen name="PreAuthLanding" component={PreAuthLanding}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen name="LoginScreen" component={LoginScreen}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen name="SignupScreen" component={SignupScreen}
                options={{ headerShown: false, gestureEnabled: false }}
            />

            <Stack.Screen name="UserProfileSetup" component={UserProfileSetup}
                options={{ headerShown: false, gestureEnabled: false }}
            />

            {/* Authenticated Screens */}
            <Stack.Screen name="AuthenticatedClientHomeScreen" component={AuthenticatedClientHomeScreen}
                options={{ headerShown: false, gestureEnabled: false }}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;