import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { user_logout } from '../../../components/authentication/user_auth/UserAuthActions';
import { API_REQUEST_SUCCESS } from '../../../constants/StatusConstants';
import { APIClient } from '../../../components/api/APIClient';
import { background_color } from '../../GlobalStyles';

import ChoiceAlertModal from '../../../components/ui/alerts/ChoiceAlertModal';
import ScarletPressable from '../../../components/ui/buttons/ScarletPressable';

import RecommendationSummary from '../../../components/recommendations/RecommendationSummary';
import RecommendationDetailModal from '../../../components/recommendations/RecommendationDetailModal';
import WeeklyStreakProgress from './WeeklyStreakProgress';
import { useUser } from '../../../components/user_data/UserContext';

// Client home screen that shows user greeting, workout streak, and recommendations
export default function ClientHomeScreen({ route }) {
  const navigation = useNavigation();
  const { userData, refreshUser } = useUser();

  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(null); // used for streak loading
  const [internalUserData, setInternalUserData] = useState(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const [recommendations, setRecommendations] = useState(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState(null);
  const [isRecModalVisible, setIsRecModalVisible] = useState(false);

  // Refresh user data on mount
  useEffect(() => {
    (async () => { await refreshUser(); })();
  }, []);

  // Navigate to streak goal settings
  const handleStreakChange = () => {
    navigation.navigate('Profile');
    requestAnimationFrame(() => {
      navigation.navigate('Profile', {
        screen: 'ProfileSettings',
      });
    });
  };

  // Fetch user's current streak when screen is focused
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
                [{
                  text: 'OK',
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'PreAuthLanding' }],
                    });
                  },
                }]
              );
            }
          } else {
            console.error(error);
          }
        }
      };

      fetchStreak();

      return () => { isActive = false; };
    }, [])
  );

  // Simulate fetching internal user info (replace with real API call if needed)
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingUserData(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setInternalUserData({ username: 'Test User' }); // Placeholder user
      setIsLoadingUserData(false);
    };
    fetchInitialData();
  }, []);

  // Fetch recommendations on focus when user data is available
  useFocusEffect(
    useCallback(() => {
      const fetchRecommendations = async () => {
        if (internalUserData) {
          setRecommendationsLoading(true);
          setRecommendationsError(null);
          try {
            const response = await APIClient.get('/recommendations', { sendAccess: true });
            if (response.data && Object.keys(response.data).length > 0) {
              setRecommendations(response.data);
            } else {
              setRecommendations(null);
            }
          } catch (err) {
            console.error("Error fetching recommendations:", err);
            if (err.message === 'Network Error') {
              setRecommendationsError("Network Error: Could not connect to server.");
            } else if (err.message === 'Access token not found') {
              setRecommendationsError("Authentication error. Please log in again.");
            } else {
              setRecommendationsError("Failed to load recommendations.");
            }
            setRecommendations(null);
          } finally {
            setRecommendationsLoading(false);
          }
        } else {
          setRecommendations(null);
          setRecommendationsError(null);
          setRecommendationsLoading(false);
        }
      };

      fetchRecommendations();
    }, [internalUserData])
  );

  // Logout alert handler
  const handleLogOut = async () => {
    setShowLogoutAlert(true);
  };

  const handleLogoutConfirmation = async (confirmed) => {
    setShowLogoutAlert(false);
    if (confirmed) {
      try {
        const logoutResponse = await user_logout();
        if (logoutResponse === API_REQUEST_SUCCESS) {
          navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
        } else {
          console.error("Logout failed after confirmation:", logoutResponse);
        }
      } catch (error) {
        console.error("Error during logout process:", error);
      }
    }
  };

  // Show loading spinner while user data loads
  if (isLoadingUserData) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // --- Main UI ---
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
      {/* Logout Alert Modal */}
      {showLogoutAlert &&
        <ChoiceAlertModal
          isVisible={true}
          title={"Logout warning"}
          message={"Are you sure you want to logout?"}
          onConfirm={() => handleLogoutConfirmation(true)}
          onCancel={() => handleLogoutConfirmation(false)}
        />
      }

      {/* Greeting and Streak */}
      <View style={styles.welcomeBanner}>
        <Text style={styles.greeting}>Welcome back, {userData.username}!</Text>
      </View>
      <Text style={styles.sub}>
        You're on a <Text style={styles.streakCount}>{streak}</Text> day streak!
      </Text>
      <View style={styles.progressContainer}>
        <WeeklyStreakProgress progress={streak} goal={userData.streak_goal} />
      </View>
      <Text style={styles.sub}>
        Your goal is {userData.streak_goal} days - let's go!🔥
      </Text>

      <View style={styles.btnContainer}>
        <ScarletPressable
          btnText="Change streak goal"
          style={styles.editStreakButton}
          onPress={handleStreakChange}
        />
      </View>

      {/* Recommendations Section */}
      <View style={styles.recommendationsContainer}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        <RecommendationSummary
          recommendations={recommendations}
          isLoading={recommendationsLoading}
          error={recommendationsError}
          onPress={() => {
            if (recommendations && Object.keys(recommendations).length > 0) {
              setIsRecModalVisible(true);
            }
          }}
        />
        <RecommendationDetailModal
          isVisible={isRecModalVisible}
          onClose={() => setIsRecModalVisible(false)}
          recommendations={recommendations}
        />
      </View>
    </ScrollView>
  );
}


// --- Styles ---
const styles = StyleSheet.create({
  scrollContentContainer: {
    paddingBottom: 40,
    paddingTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationsContainer: {
    width: "80%",
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginTop: 5,
    marginBottom: 5,
    color: 'white',
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  card: {
    width: '44%',
    aspectRatio: 1,
    margin: '3%',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    backgroundColor: '#CC0033',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  cardLabel: {
    fontSize: 16,
    color: 'white',
  },
  logoutButtonWrapper: {
    marginHorizontal: 30,
    marginTop: 10, // Reduced from 15 - adjust if needed
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#CC0033',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: background_color,
  },
  welcomeBanner: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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
    width: 250,
    height: 250,
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
