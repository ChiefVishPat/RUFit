import { useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { View, StyleSheet, Text, Dimensions, TouchableOpacity } from "react-native";
import ModalAlert from "../../../components/ui/alerts/ModalAlert";
import { get_user_profile } from "../../../components/user_data/UserProfileRequests";
import { GradientScreen } from "../../GlobalStyles"
import { LinearGradient } from 'expo-linear-gradient';
import { user_logout } from "../../../components/authentication/user_auth/UserAuthActions";
import { API_REQUEST_SUCCESS } from "../../../constants/StatusConstants";
import ChoiceAlertModal from "../../../components/ui/alerts/ChoiceAlertModal";

export default function ClientProfileScreen() {
    const route = useRoute();
    const userData = route.params.userData;
    const navigation = route.params.navigation;

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
        <GradientScreen>
            <View style={styles.container}>

                {showLogoutAlert ?
                    <ChoiceAlertModal
                        isVisible={true}
                        title={"Logout"}
                        message={"Are you sure you want to logout?"}
                        onConfirm={() => { handleLogoutConfirmation(true) }}
                        onCancel={() => { handleLogoutConfirmation(false) }} />
                    : null
                }

                <LinearGradient
                    colors={['#1a1717', '#CC0033']} // Array of gradient colors
                    style={styles.welcomeTitle}
                    start={{ x: 1, y: 0 }} // Gradient start point (top-left)
                    end={{ x: 0, y: 1 }}   // Gradient end point (bottom-right)
                >
                    <Text style={styles.welcomeText}>Hello, {userData.username}!</Text>
                </LinearGradient>

                <View style={styles.progressChart}>
                    <Text style={{color: 'white'}}>some kind of progress chart</Text>
                </View>

                <View style={styles.profileOptionsContainer}>


                    <View style={styles.profileOptionCard}>
                        <Text style={styles.optionText}>My Body Data</Text>
                    </View>

                    <View style={styles.profileOptionCard}>
                        <Text style={styles.optionText}>Profile Settings</Text>
                    </View>

                    <View style={styles.profileOptionCard}>
                        <Text style={styles.optionText}>Account Settings</Text>
                    </View>

                    <TouchableOpacity style={styles.profileOptionCard}
                        onPress={handleLogOut}>
                        <Text style={styles.optionText}>Log Out</Text>
                    </TouchableOpacity>

                </View>
            </View>

        </GradientScreen>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 0.9,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        marginTop: 60,
        width: Dimensions.get('window').width * 0.9,
        // borderColor: 'white',
        // borderWidth:2,
    },
    spacer: {
        marginVertical: 100,
    },
    welcomeTitle: {
        height: 80,
        marginHorizontal: 20,
        //marginBottom: 60,
        width: Dimensions.get('window').width * 0.8,
        justifyContent: 'center',

        shadowColor: '#1a1717',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 6,

        //borderColor: 'white',
        //borderWidth: 0.5,
        borderRadius: 10,
    },
    welcomeText: {
        fontSize: 30,
        color: 'white',
        fontWeight: 'bold',
        alignSelf: 'center',
    },
    progressChart: {
        height: 250,
        width: Dimensions.get('window').width * 0.8,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 40,


        borderColor: 'white',
        borderWidth: 0.5,
    },
    profileOptionCard: {
        alignItems: 'center',
        alignSelf: 'flex-end',
        height: 50,
        marginHorizontal: 20,
        marginBottom: 30,
        width: Dimensions.get('window').width * 0.8,
        justifyContent: 'center',
        //backgroundColor: '#CC0033',

        // Shadow for iOS
        shadowColor: '#1a1717',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 6,

        borderColor: 'white',
        borderWidth: 0.5,
        borderRadius: 10,
    },
    optionText: {
        fontSize: 25,
        fontWeight: 'bold',
        // color: '#CC0033',
        color: "white",
    }
});