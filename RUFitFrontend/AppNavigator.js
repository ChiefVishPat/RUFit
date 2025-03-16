import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthenticatedClientHomeScreen, AuthenticatedSavedWorkoutsScreen, AuthenticatedSaveWorkoutScreen} from './components/authentication/AuthenticatedScreens';
import LoginScreen from './app/preauth/LoginScreen';
import SignupScreen from './app/preauth/SignupScreen';
import PreAuthLanding from './app/preauth/preauth_landing';

const Stack = createStackNavigator();

const AppNavigator = ({ isAuthenticated }) => {
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
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="LoginScreen"
                component={LoginScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="SignupScreen"
                component={SignupScreen}
                options={{ headerShown: false }}
            />

            {/* Authenticated Screens */}
            <Stack.Screen
                name="AuthenticatedClientHomeScreen"
                component={AuthenticatedClientHomeScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AuthenticatedSavedWorkoutsScreen"
                component={AuthenticatedSavedWorkoutsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AuthenticatedSaveWorkoutScreen"
                component={AuthenticatedSaveWorkoutScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;