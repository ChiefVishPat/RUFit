import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, TextInput, Dimensions } from "react-native";
import { useFonts, BigShouldersDisplay_700Bold } from "@expo-google-fonts/big-shoulders-display";
import { Kanit_400Regular } from '@expo-google-fonts/kanit';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import { user_login } from '../../components/authentication/user_auth/UserAuthActions';
import * as status_constants from '../../constants/StatusConstants';
import { global_styles, GradientScreen } from '../GlobalStyles';
import { useUser } from '../../components/user_data/UserContext';

export default function LoginScreen() {
    const { refreshUser } = useUser();

    // Load custom fonts
    const [fontsLoaded] = useFonts({
        BigShouldersDisplay_700Bold,
        Kanit_400Regular,
    });

    const navigation = useNavigation();

    // Logo sizing
    const RutgersLogo = require("../../assets/images/rufit_logo.png");
    const screenWidth = Dimensions.get("window").width;
    const logoWidth = screenWidth * 0.8;
    const logoHeight = (910 / 2503) * logoWidth;

    // Form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [signUpError, setSignUpError] = useState('');

    // Handle login submission
    const handleLogin = async () => {
        setIsLoading(true);

        if (username && password) {
            try {
                const loginResponse = await user_login({ username, password });

                if (loginResponse === status_constants.API_REQUEST_SUCCESS) {
                    await refreshUser();
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'ClientIndex' }],
                    });
                } else {
                    if (loginResponse.status === 401) {
                        setSignUpError("Invalid credentials");
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        } else {
            setSignUpError(status_constants.EMPTY_FIELDS_ERROR);
        }
    };

    // Show loader if fonts are not yet ready
    if (!fontsLoaded) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <GradientScreen>
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
            <View style={styles.errorMessageContainer}>
                <Text style={styles.errorMessage}>{signUpError}</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.regRedirectButton}
                    onPress={() => navigation.navigate("SignupScreen")}
                >
                    <Text style={styles.regDirectBtnText}>Don't have an account? Sign up here</Text>
                </TouchableOpacity>
            </View>
        </GradientScreen>
    );
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#84888C',
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
        alignItems: 'center',
    },
    errorMessage: {
        fontSize: 16,
        fontFamily: 'Kanit_400Regular',
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
    },
    inputField: {
        backgroundColor: '#fff',
        borderRadius: 8,
        width: Dimensions.get('window').width * 0.7,
        height: 55,
        alignSelf: "center",
        padding: 12,
        fontSize: 16,
        fontFamily: 'Kanit_400Regular',
        color: '#000',
        margin: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        elevation: 3,
    },
    buttonsContainer: {
        width: Dimensions.get('window').width * 0.7,
        marginTop: 20,
    },
    loginButton: {
        backgroundColor: '#CC0033',
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
        backgroundColor: 'white',
        opacity: 0.3,
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
        fontSize: 14.5,
        fontWeight: 'bold',
        fontFamily: 'Kanit_400Regular',
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
