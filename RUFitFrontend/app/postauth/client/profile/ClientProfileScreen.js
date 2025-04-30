import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { View, StyleSheet, Text, Dimensions, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import ChoiceAlertModal from "../../../../components/ui/alerts/ChoiceAlertModal";
import { user_logout } from "../../../../components/authentication/user_auth/UserAuthActions";
import { API_REQUEST_SUCCESS } from "../../../../constants/StatusConstants";
import { background_color, GradientScreen } from "../../../GlobalStyles";
import { useUser } from "../../../../components/user_data/UserContext";

export default function ClientProfileScreen() {
    const route = useRoute();
    const userData = useUser().userData;
    // console.log(userData);
    const navigation = useNavigation();

    const [showLogoutAlert, setShowLogoutAlert] = useState(false);

    const handleLogOut = async () => {
        try {
            const logoutResponse = await user_logout();
            if (logoutResponse === API_REQUEST_SUCCESS) {
                setShowLogoutAlert(true);
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

            {showLogoutAlert && (
                <ChoiceAlertModal
                    isVisible={true}
                    title={"Logout"}
                    message={"Are you sure you want to logout?"}
                    onConfirm={() => handleLogoutConfirmation(true)}
                    onCancel={() => handleLogoutConfirmation(false)}
                />
            )}

            <LinearGradient
                colors={['#CC0033', 'darkred']} // Adjust colors as needed
                style={styles.welcomeBanner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.username}>{userData.username}</Text>

            </LinearGradient>

            <View style={styles.optionsGrid}>

                <TouchableOpacity style={styles.optionCard}
                    onPress={() => navigation.navigate('MyBodyData', { navigation })}>
                <Text style={styles.cardText}>My Body Data</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionCard}
                    onPress={() => navigation.navigate('ProfileSettings', { navigation })}>
                    <Text style={styles.cardText}>Profile Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionCard}
                    onPress={() => navigation.navigate('AccountSettings', { navigation })}>
                    <Text style={styles.cardText}>Account Settings</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.optionCard, styles.logoutCard]}
                onPress={handleLogOut}>
                <Text style={[styles.cardText, styles.logoutText]}>Log Out</Text>
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: background_color,
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 30,
        paddingHorizontal: 20,
        width: '100%',
        justifyContent: 'space-between'
        // borderColor: 'white',
        // borderWidth: 2,
    },
    topSection: {
        width: '100%',
        flexDirection: 'row',
        borderColor: 'white',
        borderWidth: 2,
    },
    welcomeBanner: {
        width: '100%',
        borderRadius: 20,
        paddingVertical: 30,
        paddingHorizontal: 20,
        marginBottom: 30,
        paddingLeft: 20,
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
        // borderColor: 'white',
        // borderWidth: 2,
    },
    greeting: {
        fontSize: 20,
        color: 'white',
        marginBottom: 5,
        fontWeight: '600',
    },
    username: {
        fontSize: 28,
        color: 'white',
        fontWeight: 'bold',
    },
    optionsGrid: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
    },
    optionCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        paddingVertical: 18,
        width: '100%',
        borderRadius: 16,
        marginBottom: 20,
        paddingLeft: 20,
        alignItems: 'flex-start',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    logoutCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        marginBottom: 50,
    },
    cardText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
    },
    logoutText: {
        color: 'white',
    },
});
