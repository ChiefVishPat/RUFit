/*
    UserProfileSetup Stack Navigator

    Flow (for client role):
        1. BodyDataScreen — user enters age, height, weight
        2. IntensityLevelScreen — user selects workout intensity
        3. SetGoalsScreen — user sets fitness goals (gain, lose, maintain, etc.)

    On completion of SetGoalsScreen, user is navigated to the main authenticated client home.

    For coach role: (flow not yet implemented)
*/

import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useRoute } from '@react-navigation/native';

import BodyDataScreen from './BodyDataScreen';
import IntensityLevelScreen from './IntensityLevelScreen';
import SetGoalsScreen from './SetGoalsScreen';
import ChooseRoleScreen from './ChooseRoleScreen';

// Stack navigator to guide the user through the setup steps
const UserProfileSetup = () => {
    const Stack = createStackNavigator();
    const route = useRoute();
    const { username, password, email } = route.params;

    return (
        <Stack.Navigator initialRouteName="BodyData">
            <Stack.Screen
                name="BodyData"
                component={BodyDataScreen}
                initialParams={{ username, password, email }}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
                name="IntensityLevel"
                component={IntensityLevelScreen}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
                name="SetGoals"
                component={SetGoalsScreen}
                options={{ headerShown: false, gestureEnabled: false }}
            />
        </Stack.Navigator>
    );
};

export default UserProfileSetup;
