import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { AuthenticatedClientHomeScreen, AuthenticatedSavedWorkoutsScreen, AuthenticatedClientProfileScreen } from '../../../components/authentication/AuthenticatedScreens';
import { get_user_profile } from '../../../components/user_data/UserProfileRequests';

const Tab = createBottomTabNavigator();

export default function ClientIndex() {

  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
  });

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await get_user_profile();
        console.log(`User profile response: ${response}`);
        setUserData(response);
      }
      catch (error) {
        console.error(error);
        setShowAlert(true);
        setAlertConfig({
          title: "Error",
          message: "Unable to retrieve user data",
        })
      }
      finally{
        setLoading(false);
      }
    }
    getUserData();
  }, []);

  /*
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);
  */

  if (loading) return null;
  return (
    <Tab.Navigator
    
    screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Workouts') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={28} color={color} />;
        },
        tabBarActiveTintColor: 'white',  // Indigo-500
        tabBarInactiveTintColor: 'white', // Slate-400
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
        // headerShown: false,

        headerTitle: route.name === 'Home' ? '🏠 Home' : route.name,
        headerStyle: {
        backgroundColor: '#CC0033',
        },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      })}
    >
      <Tab.Screen
        name="Home"
        component={AuthenticatedClientHomeScreen}
        initialParams={{userData:userData, alertConfig:alertConfig}}
        options={{ title: 'Home', headerTitle: 'Home Screen Title' }}
      />
      <Tab.Screen
        name="Workouts"
        component={AuthenticatedSavedWorkoutsScreen}
        initialParams={{userData:userData}}
        options={{ title: 'Workouts' }}
      />
      <Tab.Screen
        name="Profile"
        component={AuthenticatedClientProfileScreen}
        initialParams={{userData:userData, navigation:navigation}}
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