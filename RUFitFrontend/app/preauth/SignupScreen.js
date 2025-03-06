import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import {
    useFonts,
    BigShouldersDisplay_700Bold,
} from '@expo-google-fonts/big-shoulders-display';
import { Kanit_400Regular } from '@expo-google-fonts/kanit';
import { useState } from 'react';
import { Dimensions } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { user_registration } from '../../components/authentication/user_auth/UserAuthActions';
import { user_login } from '../../components/authentication/user_auth/UserAuthActions';
import { AuthenticatedClientHomeScreen } from '../../components/authentication/AuthenticatedScreens';
import * as status_constants from '../../constants/StatusConstants'
import LoginScreen from './LoginScreen';


export default function SignupScreen() {
    // State variables
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [signUpError, setSignUpError] = useState("");

    const navigation = useNavigation();

    // Function to handle signup flow
    const initiateSignupFlow = async () => {
        if (!username || !password || !email) {
            setSignUpError(status_constants.EMPTY_FIELDS_ERROR);
            return;
        }

        try {
            const signUpResponse = await user_registration({ email, username, password });
            if (signUpResponse === status_constants.API_REQUEST_SUCCESS) {
                const loginResponse = await user_login({ username, password });
                if (loginResponse === status_constants.API_REQUEST_SUCCESS) {
                    navigation.navigate(AuthenticatedClientHomeScreen);
                } else {
                    setSignUpError(status_constants.LOGIN_ERROR);
                }
            } else {
                setSignUpError(signUpResponse);
            }
        } catch (error) {
            setSignUpError("An error occurred. Please try again.");
        }
    };

    // Ensure fonts load before displaying the UI
    const [fontsLoaded] = useFonts({
        BigShouldersDisplay_700Bold,
        Kanit_400Regular,
    });

    const RutgersLogo = require("../../assets/images/rufit_logo.png");
    const screenWidth = Dimensions.get("window").width;
    const logoWidth = screenWidth * 0.8;
    const logoHeight = (910 / 2503) * logoWidth;

    if (!fontsLoaded) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Logo & App Name */}
            <View style={styles.logoContainer}>
                <Image
                    source={RutgersLogo}
                    style={[styles.logo, { width: logoWidth, height: logoHeight }]}
                    resizeMode="contain"
                />
                <Text style={styles.appName}>RUFit</Text>
            </View>

            {/* Input Fields */}
            <View style={styles.inputFieldsContainer}>
                <TextInput
                    style={styles.inputField}
                    placeholder="Email"
                    placeholderTextColor="#aaa"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.inputField}
                    placeholder="Username"
                    placeholderTextColor="#aaa"
                    value={username}
                    onChangeText={setUsername}
                />
                <TextInput
                    style={styles.inputField}
                    placeholder="Password"
                    placeholderTextColor="#aaa"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
            </View>

            {/* Error Message */}
            {signUpError ? (
                <View style={styles.errorMessageContainer}>
                    <Text style={styles.errorMessage}>{signUpError}</Text>
                </View>
            ) : null}

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={styles.signUpButton}
                    onPress={initiateSignupFlow} // No need for async inside onPress
                >
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.regRedirectButton}
                    onPress={() => navigation.navigate(LoginScreen)}
                >
                    <Text style={styles.regDirectBtnText}>Already have an account? Login here</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#84888C', // Gray background
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    errorMessageContainer: {
        width: Dimensions.get('window').width * 0.7,
        height: 'fit-content',
        paddingLeft: 12,
        alignItems: 'center'
    },
    errorMessage: {
        fontSize: 16,
        fontFamily: 'Kanit_400Regular', // Ensure correct font is used
        color: 'white',
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 10,
    },
    appName: {
        fontSize: 40,
        fontFamily: 'BigShouldersDisplay_700Bold',
        color: '#CC0033',
        marginTop: 10,
    },
    inputFieldsContainer: {
        width: Dimensions.get('window').width * 0.7,
        marginBottom: 10,
        //borderColor: "white",
        // borderWidth: 2,
    },
    inputField: {
        backgroundColor: '#fff',
        borderRadius: 8,
        width: Dimensions.get('window').width * 0.7,
        alignSelf: "center",
        padding: 12,
        fontSize: 16,
        fontFamily: 'Kanit_400Regular', // Ensure correct font is used
        color: '#000', // Text color
        margin: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        elevation: 3,
    },
    buttonsContainer: {
        width: Dimensions.get('window').width * 0.7,
        marginTop: 20,
        //borderColor: "white",
        //borderWidth: 2,
    },
    signUpButton: {
        backgroundColor: '#CC0033', // Scarlet red
        paddingVertical: 15,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        elevation: 5,
        alignItems: 'center',
    },
    regRedirectButton: {
        backgroundColor: 'white', // Scarlet red
        opacity: 0.4,
        paddingVertical: 15,
        borderRadius: 8,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        elevation: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Kanit_400Regular',
    },
    regDirectBtnText: {
        color: 'black',
        fontSize: 16.5,
        fontWeight: 'bold',
        fontFamily: 'Kanit_400Regular',
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
