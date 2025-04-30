import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { user_logout } from '../../../components/authentication/user_auth/UserAuthActions';
import { API_REQUEST_SUCCESS } from '../../../constants/StatusConstants';
import { useNavigation, useRoute } from '@react-navigation/native';
import ChoiceAlertModal from '../../../components/ui/alerts/ChoiceAlertModal';

// --- Recommendation Components ---
import RecommendationSummary from '../../../components/recommendations/RecommendationSummary';
import RecommendationDetailModal from '../../../components/recommendations/RecommendationDetailModal';
import { APIClient } from '../../../components/api/APIClient'; // Import APIClient

// currently fetching UserData inside if not passed directly
export default function ClientHomeScreen({ route }) { // Changed props slightly if userData isn't directly passed

    const navigation = useNavigation();
    // const route = useRoute(); // Already defined if using route prop

    // State for user data 
    const [internalUserData, setInternalUserData] = useState(null); // 
    const [isLoadingUserData, setIsLoadingUserData] = useState(true); //

    // Logout Alert State (from original code)
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);

    // New State for Recommendations
    const [recommendations, setRecommendations] = useState(null);
    const [recommendationsLoading, setRecommendationsLoading] = useState(false);
    const [recommendationsError, setRecommendationsError] = useState(null);
    const [isRecModalVisible, setIsRecModalVisible] = useState(false);
    // --- End New State ---


    // --- Fetch User Data within Component ---
    // Remove or adapt this if userData IS eventually passed as a prop
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoadingUserData(true);
            // Replace with your actual user data fetching logic if needed
            // e.g., const data = await fetch_user_profile(); setInternalUserData(data);
            // Simulate fetch for now:
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
            setInternalUserData({ username: 'Test User' }); // Placeholder
            setIsLoadingUserData(false);
        };
        fetchInitialData();
    }, []);
    // --- End Example User Data Fetch ---


    // Fetch Recommendation
    useEffect(() => {
        // Only fetch if user data is loaded (use internalUserData or passed prop userData)
        if (internalUserData) {
            const fetchRecommendations = async () => {
                setRecommendationsLoading(true);
                setRecommendationsError(null);
                setRecommendations(null); // Reset on new fetch
                try {
                    console.log("Fetching recommendations..."); 
                    const response = await APIClient.get('/recommendations', { sendAccess: true });
                    console.log("Recommendations Response:", response.data); // Log response
                    // Check if response.data is not empty object or null
                    if (response.data && Object.keys(response.data).length > 0) {
                         setRecommendations(response.data);
                    } else {
                        setRecommendations(null); // Explicitly set to null if empty/no data
                        console.log("No recommendations data received.");
                    }
                } catch (err) {
                    console.error("Error fetching recommendations:", err);
                    // Check specifically for network errors vs other errors
                    if (err.message === 'Network Error') {
                         setRecommendationsError("Network Error: Could not connect to server.");
                    } else if (err.message === 'Access token not found') {
                         setRecommendationsError("Authentication error. Please log in again.");
                    }
                     else {
                        setRecommendationsError("Failed to load recommendations.");
                    }
                } finally {
                    setRecommendationsLoading(false);
                }
            };
            fetchRecommendations();
        }
    }, [internalUserData]); // Dependency: run when user data is available/changes

    const handleLogOut = async () => {
        try {
                setShowLogoutAlert(true);

        } catch (error) {
            console.error(error);
        }
    };

    const handleLogoutConfirmation = async (confirmed) => {        setShowLogoutAlert(false);
        setShowLogoutAlert(false);
        if (confirmed) {
            try {
                // Call user_logout() only AFTER confirmation
                const logoutResponse = await user_logout();
                if (logoutResponse === API_REQUEST_SUCCESS) {
                    // Navigate only if token removal was successful
                     navigation.reset({
                        index: 0,
                        routes: [{ name: "LoginScreen" }]
                    });
                } else {
                    // Handle potential error during logout (e.g., display message)
                    console.error("Logout failed after confirmation:", logoutResponse);
                }
            } catch(error) {
                 console.error("Error during logout process:", error);
            }
        }
    };

    // Main Loading State
    // Show loading indicator while fetching initial user data
    if (isLoadingUserData) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }


    return (
        // Use ScrollView to accommodate recommendations box
        <ScrollView style={styles.container}>

            {/* --- Logout Modal --- */}
            {showLogoutAlert ?
                <ChoiceAlertModal
                    isVisible={true}
                    title={"Logout warning"}
                    message={"Are you sure you want to logout?"}
                    onConfirm={() => { handleLogoutConfirmation(true) }}
                    onCancel={() => { handleLogoutConfirmation(false) }} />
                : null
            }

            {/* --- Recommendations Section --- */}
            <Text style={styles.sectionTitle}>Recommendations</Text>
            <RecommendationSummary
                recommendations={recommendations}
                isLoading={recommendationsLoading}
                error={recommendationsError}
                onPress={() => {
                    if (recommendations && Object.keys(recommendations).length > 0) {
                         setIsRecModalVisible(true)
                    }
                }} // Only allow press if recommendations exist
            />
            {/* --- End Recommendations Section --- */}


            {/* --- Performance Section --- */}
            <Text style={styles.sectionTitle}>Performance</Text>
            <View style={styles.performanceGrid}>
                {/* --- Performance Cards --- */}
                 <View style={[styles.card]}>
                    <Ionicons name="walk" size={40} color="white" />
                    <Text style={styles.cardValue}>456</Text>
                    <Text style={styles.cardLabel}>Steps</Text>
                </View>

                <View style={[styles.card]}>
                    <Ionicons name="flame" size={40} color="white" />
                    <Text style={styles.cardValue}>210</Text>
                    <Text style={styles.cardLabel}>Kcal</Text>
                </View>

                <View style={[styles.card]}>
                    <Ionicons name="heart" size={40} color="white" />
                    <Text style={styles.cardValue}>78</Text>
                    <Text style={styles.cardLabel}>bpm</Text>
                </View>

                <View style={[styles.card]}>
                    <Ionicons name="location" size={40} color="white" />
                    <Text style={styles.cardValue}>100 m</Text>
                    <Text style={styles.cardLabel}>Distance</Text>
                </View>
                 {/* --- End Performance Cards --- */}
            </View>
            {/* --- End Performance Section --- */}


            {/* --- Logout Button --- */}
            <View style={styles.logoutButtonWrapper}>
                 {/* Replace Button with TouchableOpacity */}
                 <TouchableOpacity style={styles.logoutButton} onPress={handleLogOut}>
                    <Ionicons name="log-out-outline" size={20} color="white" style={styles.logoutIcon}/>
                    <Text style={styles.logoutButtonText}>Log Out</Text>
                 </TouchableOpacity>
            </View>


            {/* --- Render Recommendation Modal --- */}
            {/* will only render content if recommendations is not null */}
            <RecommendationDetailModal
                isVisible={isRecModalVisible}
                onClose={() => setIsRecModalVisible(false)}
                recommendations={recommendations}
            />
            {/* --- End Recommendation Modal --- */}

        </ScrollView> // End ScrollView
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1F1F1F', // Original background color
        paddingTop: 20, // Adjusted top padding slightly
    },
     centered: { // Added for centering loading indicator
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: { // Renamed from performanceTitle for reusability
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 20,
        marginTop: 20, // Consistent top margin for sections
        marginBottom: 5, // Space below title
        color: 'white',
    },
    performanceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingHorizontal: 10, // Reduced horizontal padding slightly to better fit cards
        marginTop: 10,
        marginBottom: 0, // Space below grid
    },
    card: {
        width: '44%', // Adjusted width slightly for better fit with padding
        aspectRatio: 1,
        margin: '3%', // Use percentage margin for better spacing
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
        marginTop: 0, 
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
});