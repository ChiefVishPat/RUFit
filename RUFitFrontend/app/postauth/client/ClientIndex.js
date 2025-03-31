/* 

      return (
        <View style={styles.bottomTab}>
            <TouchableOpacity
                style={styles.tabButton}
                onPress={() => navigation.navigate('AuthenticatedClientHomeScreen')}>
                <Ionicons name="home" size={24} color="white" />
                <Text style={styles.tabLabel}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.tabButton}
                onPress={() => navigation.navigate('Activity')}>
                <Ionicons name="stats-chart" size={24} color="white" />
                <Text style={styles.tabLabel}>Activity</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.tabButton}
                onPress={() => navigation.navigate('AuthenticatedSavedWorkoutsScreen')}>
                <Ionicons name="barbell" size={24} color="white" />
                <Text style={styles.tabLabel}>Workouts</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.tabButton}
                onPress={() => navigation.navigate('Macros')}>
                <Ionicons name="fast-food" size={24} color="white" />
                <Text style={styles.tabLabel}>Macros</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.tabButton}
                onPress={() => navigation.navigate('Exercises')}>
                <Ionicons name="fitness" size={24} color="white" />
                <Text style={styles.tabLabel}>Exercises</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.tabButton}
                onPress={() => navigation.navigate('Profile')}>
                <Ionicons name="person" size={24} color="white" />
                <Text style={styles.tabLabel}>Profile</Text>
            </TouchableOpacity>
        </View>
    );

*/


import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthenticatedClientHomeScreen, AuthenticatedSavedWorkoutsScreen, AuthenticatedClientProfileScreen } from '../../../components/authentication/AuthenticatedScreens';
import { NavigationContainer } from '@react-navigation/native';


const Tab = createBottomTabNavigator();

export default function ClientIndex() {
  console.log("yeah im working");
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
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={AuthenticatedClientHomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Workouts"
        component={AuthenticatedSavedWorkoutsScreen}
        options={{ title: 'Workouts' }}
      />
      <Tab.Screen
        name="Profile"
        component={AuthenticatedClientProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
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