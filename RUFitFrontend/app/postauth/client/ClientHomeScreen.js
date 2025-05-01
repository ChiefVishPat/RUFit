import React, { useEffect, useState, useCallback } from 'react'; // Added useCallback
import { StyleSheet, Text, View, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native'; // Removed Button import
import { Ionicons } from '@expo/vector-icons';
import { user_logout } from '../../../components/authentication/user_auth/UserAuthActions';
import { API_REQUEST_SUCCESS } from '../../../constants/StatusConstants';
// Import useFocusEffect
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import ChoiceAlertModal from '../../../components/ui/alerts/ChoiceAlertModal';

// --- Recommendation Components ---
import RecommendationSummary from '../../../components/recommendations/RecommendationSummary';
import RecommendationDetailModal from '../../../components/recommendations/RecommendationDetailModal';
import { APIClient } from '../../../components/api/APIClient'; // Import APIClient

// currently fetching UserData inside if not passed directly
export default function ClientHomeScreen({ route }) {

    const navigation = useNavigation();

    // Logout Alert State
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);

    // Recommendations State
    const [recommendations, setRecommendations] = useState(null);
    const [recommendationsLoading, setRecommendationsLoading] = useState(false);
    const [recommendationsError, setRecommendationsError] = useState(null);
    const [isRecModalVisible, setIsRecModalVisible] = useState(false);

    // --- Fetch Recommendations using useFocusEffect ---
useFocusEffect(
    useCallback(() => {
        const fetchRecommendations = async () => {
            // Only fetch if ACTUAL user data is loaded
            if (userData) { // <--- MODIFIED Check
                console.log("HomeScreen focused, fetching recommendations...");
                setRecommendationsLoading(true);
                setRecommendationsError(null);
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
                     setRecommendations(null);
                } finally {
                    setRecommendationsLoading(false);
                }
            } else {
                console.log("HomeScreen focused, but no user data yet.");
                setRecommendations(null);
                setRecommendationsError(null);
                setRecommendationsLoading(false);
            }
        };

        fetchRecommendations();

    }, [userData]) // <--- MODIFIED Dependency Array
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
            <Text style={styles.sectionTitle}>Performance</Text>
            <View style={styles.performanceGrid}>
                 <View style={styles.card}>
                    <Ionicons name="walk" size={40} color="white" />
                    <Text style={styles.cardValue}>456</Text>
                    <Text style={styles.cardLabel}>Steps</Text>
                </View>
                <View style={styles.card}>
                    <Ionicons name="flame" size={40} color="white" />
                    <Text style={styles.cardValue}>210</Text>
                    <Text style={styles.cardLabel}>Kcal</Text>
                </View>
                <View style={styles.card}>
                    <Ionicons name="heart" size={40} color="white" />
                    <Text style={styles.cardValue}>78</Text>
                    <Text style={styles.cardLabel}>bpm</Text>
                </View>
                <View style={styles.card}>
                    <Ionicons name="location" size={40} color="white" />
                    <Text style={styles.cardValue}>100 m</Text>
                    <Text style={styles.cardLabel}>Distance</Text>
                </View>
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

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1F1F1F',
    },
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
        marginTop: 10,
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