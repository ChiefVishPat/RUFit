import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthenticatedHomeScreen } from './components/AuthenticatedScreens';
import LoginScreen from './app/preauth/LoginScreen';
import SignupScreen from './app/preauth/SignupScreen';
import PreAuthLanding from './app/preauth/preauth_landing';

const Stack = createStackNavigator();

const AppNavigator = ({ isAuthenticated }) => {
    return (
        <Stack.Navigator initialRouteName={isAuthenticated ? 'AuthenticatedHomeScreen' : 'PreAuthLanding'}>
                {/* Non-authenticated Screens */}
                <Stack.Screen name="PreAuthLanding" component={PreAuthLanding}
                    options={{ headerShown: false }}
                />
                <Stack.Screen name="LoginScreen" component={LoginScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen name="SignupScreen" component={SignupScreen}
                    options={{ headerShown: false }}
                />

                {/* Authenticated Screens */}
                <Stack.Screen name="AuthenticatedHomeScreen" component={AuthenticatedHomeScreen}
                    options={{ headerShown: true }}
                />
        </Stack.Navigator>
    );
};

export default AppNavigator;