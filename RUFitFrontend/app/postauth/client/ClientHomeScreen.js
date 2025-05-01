import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

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


// currently fetching UserData inside if not passed directly
export default function ClientHomeScreen({ route }) {

    const navigation = useNavigation();

    // User workout streak data
    const [streak, setStreak] = useState(null);
    const userData = useUser().userData;

    const handleStreakChange = () => {
      navigation.navigate('Profile');

      requestAnimationFrame(() => {
        navigation.navigate('Profile', {
          screen: 'ProfileSettings',
        });
      });
    }

    // reloads and fetches user workout streak every time screen is in focus
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


    // State for user data
    const [internalUserData, setInternalUserData] = useState(null);
    const [isLoadingUserData, setIsLoadingUserData] = useState(true);

    // Logout Alert State
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);

    // Recommendations State
    const [recommendations, setRecommendations] = useState(null);
    const [recommendationsLoading, setRecommendationsLoading] = useState(false);
    const [recommendationsError, setRecommendationsError] = useState(null);
    const [isRecModalVisible, setIsRecModalVisible] = useState(false);

    // --- Fetch User Data (runs once) ---
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoadingUserData(true);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate fetch
            setInternalUserData({ username: 'Test User' }); // Placeholder
            setIsLoadingUserData(false);
        };
        fetchInitialData();
    }, []);


    // --- Fetch Recommendations using useFocusEffect ---
    useFocusEffect(
        // useCallback ensures the function identity is stable across renders
        // preventing unnecessary effect runs if dependencies are the same.
        useCallback(() => {
            const fetchRecommendations = async () => {
                // Only fetch if user data is loaded
                if (internalUserData) {
                    console.log("HomeScreen focused, fetching recommendations..."); // Log focus/fetch
                    setRecommendationsLoading(true);
                    setRecommendationsError(null);
                    // Don't reset recommendations here if you want to show stale data while loading
                    // setRecommendations(null);
                    try {
                        const response = await APIClient.get('/recommendations', { sendAccess: true });
                        console.log("Recommendations Response:", response.data);
                        if (response.data && Object.keys(response.data).length > 0) {
                             setRecommendations(response.data);
                        } else {
                            setRecommendations(null);
                            console.log("No recommendations data received.");
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
                         setRecommendations(null); // Ensure recommendations are null on error
                    } finally {
                        setRecommendationsLoading(false);
                    }
                } else {
                    console.log("HomeScreen focused, but no user data yet.");
                    // Ensure state is clear if no user data
                    setRecommendations(null);
                    setRecommendationsError(null);
                    setRecommendationsLoading(false);
                }
            };

            fetchRecommendations();

            // Optional: Cleanup function if needed when screen loses focus
            // return () => {
            //   console.log("HomeScreen unfocused");
            //   // e.g., cancel fetches, clear timers
            // };
        }, [internalUserData]) // Dependency: re-run if internalUserData changes while screen is focused
    );
    // --- End useFocusEffect ---


    // --- Logout Handlers (Unchanged) ---
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
            } catch(error) {
                 console.error("Error during logout process:", error);
            }
        }
    };

    // --- Loading State ---
    if (isLoadingUserData) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    // --- Render ---
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>

            {/* --- Logout Modal --- */}
            {showLogoutAlert &&
                <ChoiceAlertModal
                    isVisible={true}
                    title={"Logout warning"}
                    message={"Are you sure you want to logout?"}
                    onConfirm={() => handleLogoutConfirmation(true)}
                    onCancel={() => handleLogoutConfirmation(false)} />
            }

            {/* --- Recommendations Section --- */}
            <Text style={styles.sectionTitle}>Recommendations</Text>
            <RecommendationSummary
                recommendations={recommendations}
                // Pass loading/error state directly to the summary component
                isLoading={recommendationsLoading}
                error={recommendationsError}
                onPress={() => {
                    // Check for actual recommendation data before opening modal
                    if (recommendations && Object.keys(recommendations).length > 0) {
                         setIsRecModalVisible(true)
                    }
                }}
            />

            {/* --- Performance Section --- */}
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

            {/* --- Logout Button --- */}
            <View style={styles.logoutButtonWrapper}>
                 <TouchableOpacity style={styles.logoutButton} onPress={handleLogOut}>
                    <Ionicons name="log-out-outline" size={20} color="white" style={styles.logoutIcon}/>
                    <Text style={styles.logoutButtonText}>Log Out</Text>
                 </TouchableOpacity>
            </View>


            {/* --- Render Recommendation Modal --- */}
            <RecommendationDetailModal
                isVisible={isRecModalVisible}
                onClose={() => setIsRecModalVisible(false)}
                recommendations={recommendations}
            />

        </ScrollView>
    );
}

// --- Styles (Keep existing styles from previous step) ---
const styles = StyleSheet.create({
    scrollContentContainer: {
        paddingBottom: 40,
        paddingTop: 20,
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
        marginLeft: 20,
        marginTop: 25,
        marginBottom: 5,
        color: 'white',
    },
    performanceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingHorizontal: 10,
        marginTop: 10,
        // Removed marginBottom: 10
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
