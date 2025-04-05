import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../../../components/ui/BottomNavBar'; // Import BottomNavBar
import TopHeader from '../../../components/TopHeader'; // Import TopHeader
import { APIClient } from '../../../components/api/APIClient';
import { user_logout } from '../../../components/authentication/user_auth/UserAuthActions';
import { Button } from 'react-native';
import { API_REQUEST_SUCCESS } from '../../../constants/StatusConstants';
import { useNavigation, useRoute} from '@react-navigation/native';
import ModalAlert from '../../../components/ui/alerts/ModalAlert';
import ChoiceAlertModal from '../../../components/ui/alerts/ChoiceAlertModal';

export default function ClientHomeScreen({userData, alertConfig}) {

    const navigation = useNavigation();
    const route = useRoute();

    const [showUserDataAlert, setShowUserDataAlert] = useState(userData ? false : true);
    
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);
    // const [logoutConfirm, setLogoutConfirm] = useState(false);

    const handleLogOut = async () => {
        try {
            const logoutResponse = await user_logout();
            if (logoutResponse === API_REQUEST_SUCCESS) {
                setShowLogoutAlert(true); // Show modal and WAIT for user choice
            }
        } catch (error) {
            console.error(error);
        }
    };
    
    const handleLogoutConfirmation = (confirmed) => {
        setShowLogoutAlert(false);
        if (confirmed) {
            navigation.reset({
                index: 0,
                routes: [{ name: "LoginScreen" }]
            });
        }
    };

    return (
        <View style={styles.container}>

            {/*
            {showUserDataAlert ?
                <ModalAlert
                    isVisible={showUserDataAlert}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    onConfirm={() => { setShowUserDataAlert(false) }}>
                </ModalAlert> : null}
             */}
            

            {showLogoutAlert ?
                <ChoiceAlertModal
                    isVisible={true}
                    title={"Logout warning"}
                    message={"Are you sure you want to logout?"}
                    onConfirm={() => { handleLogoutConfirmation(true) }}
                    onCancel={() => { handleLogoutConfirmation(false) }} />
                : null
            }
            {/* Reusable Header */}
            <TopHeader
                title="HOME"
                showBackButton={false}
                showShareButton={true}
            />

            {/* Performance Section */}
            <Text style={styles.performanceTitle}>Performance</Text>
            <View style={styles.performanceGrid}>
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

            </View>
            <Button title="Btn" onPress={handleLogOut} />

        </View>
    );
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1F1F1F',
        paddingTop: 50,
    },
    performanceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 20,
        marginTop: 10,
        color: 'white',
    },
    performanceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginTop: 10,
    },
    card: {
        width: '40%',
        aspectRatio: 1,
        margin: 10,
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
});
