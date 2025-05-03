import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import * as authenticated_screens from './components/authentication/AuthenticatedScreens';
import SavedWorkoutsScreen from './app/postauth/client/workouts/SavedWorkoutsScreen';
import SaveWorkoutScreen from './app/postauth/client/workouts/SaveWorkoutScreen';
import ClientIndex from './app/postauth/client/ClientIndex'; // ⛔ no ClientIndexWrapper anymore
import LoginScreen from './app/preauth/LoginScreen';
import SignupScreen from './app/preauth/signup_flow/SignupScreen';
import UserProfileSetup from './app/preauth/signup_flow/UserProfileSetup';
import PreAuthLanding from './app/preauth/preauth_landing';
import SelectWorkout from './app/postauth/client/workouts/SelectWorkout';
import MyBodyDataScreen from './app/postauth/client/profile/MyBodyData';
import { UserProvider } from './components/user_data/UserContext'; // ✅ context up top

const MainStack = createStackNavigator();
const RootStack = createStackNavigator();

function MainStackScreen({ route }) {
    const isAuthenticated = route.params?.isAuthenticated;

    const screens = (
        <MainStack.Navigator
            initialRouteName={isAuthenticated ? 'ClientIndex' : 'PreAuthLanding'}
        >
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
                component={authenticated_screens.AuthenticatedWorkoutNavigator}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <MainStack.Screen
                name="AuthenticatedExerciseNavigator"
                component={authenticated_screens.AuthenticatedExerciseNavigator}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <MainStack.Screen
                name="AuthenticatedMacroTrackerNavigator"
                component={authenticated_screens.AuthenticatedMacroTrackerNavigator}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <MainStack.Screen
                name="MyBodyData"
                component={MyBodyDataScreen}
            // options={{ headerShown: false }}
            />
        </MainStack.Navigator>
    );

    console.log(`main stack: ${isAuthenticated}`);
    return isAuthenticated ? <UserProvider>{screens}</UserProvider> : screens;
}

const AppNavigator = ({ isAuthenticated }) => {
    return (
        <UserProvider>
            <RootStack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName="Main"
            >
                <RootStack.Screen
                    name="Main"
                    component={MainStackScreen}
                    initialParams={{ isAuthenticated }} // ✅ pass as route param now
                />

                {/* Modal Screens */}
                <RootStack.Screen
                    name="WorkoutsModal"
                    component={SelectWorkout}
                    options={{
                        presentation: 'modal',
                        headerShown: false,
                        gestureEnabled: true,
                    }}
                />
                <RootStack.Screen
                    name="SaveWorkoutModal"
                    component={SaveWorkoutScreen}
                    options={{
                        presentation: 'modal',
                        headerShown: false,
                        gestureEnabled: true,
                    }}
                />
            </RootStack.Navigator>
        </UserProvider>
    );
};

export default AppNavigator;