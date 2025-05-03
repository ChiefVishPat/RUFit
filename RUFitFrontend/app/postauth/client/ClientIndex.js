import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import {
  AuthenticatedClientHomeScreen,
  AuthenticatedWorkoutNavigator,
  AuthenticatedExerciseNavigator,
  AuthenticatedMacroTrackerNavigator
} from '../../../components/authentication/AuthenticatedScreens';
import ScreenHeader from './ScreenHeader';
import ProfileNavigator from './profile/ProfileNavigator';
import { useUser } from '../../../components/user_data/UserContext';
import { LinearGradient } from 'expo-linear-gradient';

const Tab = createBottomTabNavigator();

export default function ClientIndex() {
  const navigation = useNavigation();
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
  });

  let context;
  try {
    context = useUser();
  } catch (err) {
    return null; // Context not mounted yet
  }

  const { userData, loading } = context;

  if (loading || !userData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: 'white' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'WorkoutNavigator') iconName = focused ? 'analytics' : 'analytics-outline';
          else if (route.name === 'ExerciseNavigator') iconName = focused ? 'barbell' : 'barbell-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          else if (route.name === 'MacroTracker') iconName = focused ? 'nutrition' : 'nutrition-outline';

          return <Ionicons name={iconName} size={28} color={color} />;
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'white',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          position: 'absolute',
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={['#CC0033', 'darkred']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          />
        ),
        header: () => <ScreenHeader title={route.name} />,
      })}
    >
      <Tab.Screen
        name="Home"
        component={AuthenticatedClientHomeScreen}
        initialParams={{ alertConfig: alertConfig }}
      />
      <Tab.Screen
        name="WorkoutNavigator"
        component={AuthenticatedWorkoutNavigator}
        options={{ headerShown: false, title: 'Workouts' }}
      />
      <Tab.Screen
        name="ExerciseNavigator"
        component={AuthenticatedExerciseNavigator}
        options={{ headerShown: false, title: 'Exercises' }}
      />
      <Tab.Screen
        name="MacroTracker"
        component={AuthenticatedMacroTrackerNavigator}
        options={{ headerShown: false, title: 'Macros' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarItem: {
    paddingVertical: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
});
