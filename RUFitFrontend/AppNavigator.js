import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect } from 'react';
import * as authenticated_screens from './components/authentication/AuthenticatedScreens';
import SavedWorkoutsScreen from './app/postauth/client/workouts/SavedWorkoutsScreen';
import SaveWorkoutScreen from './app/postauth/client/workouts/SaveWorkoutScreen';
import ClientIndex from './app/postauth/client/ClientIndex';
import LoginScreen from './app/preauth/LoginScreen';
import SignupScreen from './app/preauth/signup_flow/SignupScreen';
import UserProfileSetup from './app/preauth/signup_flow/UserProfileSetup';
import PreAuthLanding from './app/preauth/preauth_landing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SelectWorkout from './app/postauth/client/workouts/SelectWorkout';

const Stack = createStackNavigator();
const MainStack = createStackNavigator();
const RootStack = createStackNavigator(); // wraps both main and modals

function MainStackScreen({ isAuthenticated }) {
    return (
        <MainStack.Navigator
            initialRouteName={
                isAuthenticated ? 'ClientIndex' : 'PreAuthLanding'
            }>
            {/* Non-authenticated Screens */}

            <MainStack.Screen
                name="ClientIndex"
                component={ClientIndex}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <MainStack.Screen
                name="PreAuthLanding"
                component={PreAuthLanding}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <MainStack.Screen
                name="LoginScreen"
                component={LoginScreen}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <MainStack.Screen
                name="SignupScreen"
                component={SignupScreen}
                options={{ headerShown: false, gestureEnabled: false }}
            />

            <MainStack.Screen
                name="UserProfileSetup"
                component={UserProfileSetup}
                options={{ headerShown: false, gestureEnabled: false }}
            />

            {/* Authenticated Screens */}
            <MainStack.Screen
                name="AuthenticatedClientHomeScreen"
                component={authenticated_screens.AuthenticatedClientHomeScreen}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <MainStack.Screen
                name="AuthenticatedWorkoutNavigator"
                component={
                    authenticated_screens.AuthenticatedWorkoutNavigator
                }
                options={{ headerShown: false, gestureEnabled: false }}
            />

            <MainStack.Screen
                name="AuthenticatedExerciseNavigator"
                component={
                    authenticated_screens.AuthenticatedExerciseNavigator
                }
                options={{ headerShown: false, gestureEnabled: false }}
            />

            <MainStack.Screen
                name="AuthenticatedMyBodyDataScreen"
                component={authenticated_screens.AuthenticatedMyBodyDataScreen}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <MainStack.Screen
                name="AuthenticatedAccountSettingsScreen"
                component={
                    authenticated_screens.AuthenticatedAccountSettingsScreen
                }
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <MainStack.Screen
                name="AuthenticatedProfileSettingsScreen"
                component={
                    authenticated_screens.AuthenticatedProfileSettingsScreen
                }
                options={{ headerShown: false, gestureEnabled: false }}
            />
        </MainStack.Navigator>
    );
}

const AppNavigator = ({ isAuthenticated }) => {

    return (
        <RootStack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName="Main"
        >
            <RootStack.Screen
                name="Main"
                children={() => <MainStackScreen isAuthenticated={isAuthenticated} />}
            />

            {/* These will allow ExerciseDescriptionScreen to access existing workouts as a modal */}
            <RootStack.Screen
                name="WorkoutsModal"
                component={SelectWorkout} // or import directly if not in that object
                options={{
                    presentation: 'modal',       // 👈 this makes it show as a modal
                    headerShown: false,          // or true, depending on your design
                    gestureEnabled: true,        // allow swipe-to-close
                }}
            />
            
            <RootStack.Screen
                name="SaveWorkoutModal"
                component={SaveWorkoutScreen} // or import directly if not in that object
                options={{
                    presentation: 'modal',       // 👈 this makes it show as a modal
                    headerShown: false,          // or true, depending on your design
                    gestureEnabled: true,        // allow swipe-to-close
                }}
            />
        </RootStack.Navigator>
    );
};
//need to add stack screen for barcode and macro page
export default AppNavigator;