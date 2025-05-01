import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { APIClient } from '../../../components/api/APIClient';
import { background_color } from '../../GlobalStyles';
import WeeklyStreakProgress from './WeeklyStreakProgress';
import { Navigation } from 'react-native-navigation';
import { user_logout } from '../../../components/authentication/user_auth/UserAuthActions';
import { API_REQUEST_SUCCESS } from '../../../constants/StatusConstants';
import ScarletPressable from '../../../components/ui/buttons/ScarletPressable';
import { useUser } from '../../../components/user_data/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function ClientHomeScreen() {

  const route = useRoute();
  const navigation = useNavigation();

  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  const userData = useUser().userData;

  const handleStreakChange = () => {
    navigation.navigate('Profile');

    requestAnimationFrame(() => {
      navigation.navigate('Profile', {
        screen: 'ProfileSettings',
      });
    });
  }


  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchStreak = async () => {
        try {
          const response = await APIClient.get('/workout/streak', { sendAccess: true });
          if (isActive) {
            setStreak(response.data.streak);
            setLoading(false);
          }
        } catch (error) {
          if (error.status === 401) {
            const result = user_logout();
            if (result === API_REQUEST_SUCCESS) {
              Alert.alert(
                'Logged out',
                "You've been logged out. Please sign in again.",
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'PreAuthLanding' }],
                      });
                    },
                  },
                ]
              );
            }
          } else {
            console.error(error);
          }
        }
      };

      fetchStreak();

      // cleanup to avoid setting state on unmounted screen
      return () => {
        isActive = false;
      };
    }, [])
  );


  if (loading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.welcomeBanner}>
        <Text style={styles.greeting}>Welcome back, {userData.username}!</Text>
      </View>

      <Text style={styles.sub}>You're on a <Text style={styles.streakCount}>{streak}</Text> day streak!</Text>
      <View style={styles.progressContainer}>
        <WeeklyStreakProgress progress={streak} goal={userData.streak_goal} />
      </View>


      <Text style={styles.sub}>Your goal is {userData.streak_goal} days - let's go!🔥</Text>

      <View style={styles.btnContainer}>
        <ScarletPressable btnText="Change streak goal" style={styles.editStreakButton} onPress={handleStreakChange}></ScarletPressable>
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: background_color,
    // borderColor: "white",
    // borderWidth: 2,
  },
  welcomeBanner: {
    justifyContent: 'center',
    alignItems: 'center',
    // borderColor: "white",
    // borderWidth: 2,
    marginTop: 40,
  },
  greeting: {
    fontSize: 38,
    fontWeight: '600',
    marginBottom: 12,
    color: "white",
  },
  streak: {
    fontSize: 20,
    color: '#ff6347',
    fontWeight: "bold",
    marginTop: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    // marginTop: 10,
    width: 250,
    height: 250,
    // borderColor: "white",
    // borderWidth: 2,
  },
  sub: {
    marginTop: 10,
    fontSize: 25,
    fontWeight: '600',
    marginBottom: 12,
    color: "white",
  },
  streakCount: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 12,
    color: "orange",
  },
  btnContainer: {
    marginTop: 20,
    width: '60%',
  },
  editStreakButton: {
    width: 100,
  },
  btnText: {
    color: 'white'
  }
});
