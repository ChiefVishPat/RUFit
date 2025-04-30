import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { AuthenticatedClientHomeScreen, AuthenticatedClientProfileScreen, AuthenticatedWorkoutNavigator, AuthenticatedExerciseNavigator, AuthenticatedMacroTrackerNavigator } from '../../../components/authentication/AuthenticatedScreens';
import { get_user_profile } from '../../../components/user_data/UserProfileRequests';
import ScreenHeader from './ScreenHeader';
import ProfileNavigator from './profile/ProfileNavigator';
import { UserProvider } from '../../../components/user_data/UserContext';
import { useUser } from '../../../components/user_data/UserContext';


const Tab = createBottomTabNavigator();

export default function ClientIndex() {

  console.log('navigated to ClientIndex');
  const navigation = useNavigation();
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
  });

  // const [userData, setUserData] = useState(null);
  let context;
  try {
    context = useUser();
  } catch (err) {
    // If called outside a provider — e.g. before UserProvider is mounted
    return null;
  }

  const { userData, loading } = context;

  // useEffect(() => {
  //   const getUserData = async () => {
  //     try {
  //       const response = await get_user_profile();
  //       console.log(`User profile response: ${response}`);
  //       setUserData(response.data);
  //     }
  //     catch (error) {
  //       console.error(error);
  //       setShowAlert(true);
  //       setAlertConfig({
  //         title: "Error",
  //         message: "Unable to retrieve user data",
  //       })
  //     }
  //     finally {
  //       setLoading(false);
  //     }
  //   }
  //   getUserData();
  // }, []);

  /*
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);
  */

  if (loading || !userData) return null;
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'WorkoutNavigator') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'ExerciseNavigator') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'MacroTracker') {
            iconName = focused ? 'nutrition' : 'nutrition-outline';
          }

          return <Ionicons name={iconName} size={28} color={color} />;
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'white',
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,

        header: () => <ScreenHeader title={route.name} />
      })}
    >

      <Tab.Screen
        name="Home"
        component={AuthenticatedClientHomeScreen}
        initialParams={{ userData: userData, alertConfig: alertConfig }}

      />
      <Tab.Screen
        name="WorkoutNavigator"
        component={AuthenticatedWorkoutNavigator}
        initialParams={{ userData: userData }}
        options={{ headerShown: false, title: 'Workouts' }}
      />
      <Tab.Screen
        name="ExerciseNavigator"
        component={AuthenticatedExerciseNavigator}
        initialParams={{ userData: userData }}
        options={{ headerShown: false, title: 'Exercises' }}
      />
      <Tab.Screen
        name="MacroTracker"
        component={AuthenticatedMacroTrackerNavigator}
        initialParams={{ userData }}
        options={{ headerShown: false, title: 'Macros' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        initialParams={{ userData: userData }}
        options={{ title: 'Profile' }}
      />

    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    //position: 'absolute',
    height: 80,
    borderTopWidth: 0,
    backgroundColor: '#CC0033',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    paddingBottom: 10,
  },
  tabBarItem: {
    paddingVertical: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
});