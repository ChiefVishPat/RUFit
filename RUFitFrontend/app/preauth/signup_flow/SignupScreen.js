import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { global_styles, GradientScreen } from '../../GlobalStyles';
import ScarletPressable from '../../../components/ui/buttons/ScarletPressable';
import {
    useFonts,
    BigShouldersDisplay_700Bold,
} from '@expo-google-fonts/big-shoulders-display';
import { Kanit_400Regular } from '@expo-google-fonts/kanit';
import { useState } from 'react';
import { Dimensions } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { user_registration } from '../../../components/authentication/user_auth/UserAuthActions';
import { user_login } from '../../../components/authentication/user_auth/UserAuthActions';
import { AuthenticatedClientHomeScreen, AuthenticatedHomeScreen } from '../../../components/authentication/AuthenticatedScreens';
import * as status_constants from '../../../constants/StatusConstants'
import LoginScreen from '../LoginScreen';
import { UserProfileSetup } from './UserProfileSetup';

export default function SignupScreen() {
    // Ensure fonts load before display
    const [fontsLoaded] = useFonts({
        BigShouldersDisplay_700Bold,
        Kanit_400Regular,
    });

    const RutgersLogo = require('../../../assets/images/rufit_logo.png');
    const screenWidth = Dimensions.get('window').width;
    const logoWidth = screenWidth * 0.8;
    const logoHeight = (910 / 2503) * logoWidth;

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    
    const [signUpError, setSignUpError] = useState('');

    const navigation = useNavigation();

    const initiateUserRegistration = async() => {
        if (username && password){
            const signUpResponse = await user_registration({ username, password });
            if (signUpResponse == status_constants.API_REQUEST_SUCCESS){
                const loginResponse = await user_login({ username, password });
                if (loginResponse == status_constants.API_REQUEST_SUCCESS){
                    navigation.navigate(AuthenticatedClientHomeScreen);
                }
            }
            else{
                setSignUpError(signUpResponse); // will be appropriate error message
            }
        }
        else{
            setSignUpError(status_constants.EMPTY_FIELDS_ERROR);
        }
    }

    if (!fontsLoaded) {
        return (
            <View style={global_styles.centeredContainer}>
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
                    style={[
                        styles.logo,
                        { width: logoWidth, height: logoHeight },
                    ]}
                    resizeMode="contain"
                />
                <Text style={styles.appName}>RUFit</Text>
            </View>

            {/* Input Fields */}
            <View style={styles.inputFieldsContainer}>
                {/* Email Input */}
                <TextInput
                        style={styles.inputField}
                        placeholder="Email"
                        placeholderTextColor="#aaa"
                        value={email}
                        onChangeText={setEmail}
                        require={false}
                    />
                    {/* Username Input */}
                    <TextInput
                        style={styles.inputField}
                        placeholder="Username"
                        placeholderTextColor="#aaa"
                        value={username}
                        onChangeText={setUsername}
                    />

                    {/* Password Input */}
                    <TextInput
                        style={styles.inputField}
                        placeholder="Password"
                        placeholderTextColor="#aaa"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
            </View>

            <View style={styles.errorMessageContainer}>
                <Text style={styles.errorMessage} >
                    { signUpError }
                </Text>
            </View>

            {/* Buttons */}

            <View style={styles.buttonsContainer}>
                <ScarletPressable
                    btnText="Sign Up"
                    // we need to fix this: once signed up, we should hit the Login endpoint
                    // and authenticate the user, then routing to home screen
                    onPress={ () => {
                        navigation.navigate('UserProfileSetup', {
                            email: email,
                            username: username,
                            password: password
                        })
                    } }>
                </ScarletPressable>
                <TouchableOpacity
                    style={styles.regRedirectButton}
                    // Temporarily navigates to HomeScreen. Will need to ensure proper authentication
                    onPress={() => { navigation.navigate(LoginScreen); }}>
                    <Text style={styles.regDirectBtnText}>Already have an account? Login here</Text>
                </TouchableOpacity>
            </View>
        </GradientScreen>
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
        height: 55,
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
});
