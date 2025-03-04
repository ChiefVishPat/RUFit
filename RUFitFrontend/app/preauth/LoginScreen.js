import { useRouter } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, TextInput } from "react-native";
import { useFonts, BigShouldersDisplay_700Bold } from "@expo-google-fonts/big-shoulders-display";
import { Kanit_400Regular } from '@expo-google-fonts/kanit';
import { useState } from 'react';
import { Dimensions } from 'react-native';


export default function Page() {
    // Ensure fonts load before display
    const [fontsLoaded] = useFonts({
        BigShouldersDisplay_700Bold,
        Kanit_400Regular,
    });

    const router = useRouter();
    const RutgersLogo = require("../../assets/images/rufit_logo.png");
    const screenWidth = Dimensions.get("window").width;
    const logoWidth = screenWidth * 0.8
    const logoHeight = (910 / 2503) * logoWidth

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
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
                    style={[
                        styles.logo,
                        { width: logoWidth, height: logoHeight },
                    ]}
                    resizeMode="contain"
                />
                <Text style={styles.appName}>RUFit</Text>
            </View>

            {/* Input Fields */}
            <View style={styles.inputContainer}>
                <View style={styles.inputContainer}>
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
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/home')}>
                    <Text style={styles.buttonText}>Login</Text>
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
    inputContainer: {
        width: '80%',
        marginBottom: 20,
    },
    inputField: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        fontFamily: 'Kanit_400Regular', // Ensure correct font is used
        color: '#000', // Text color
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        elevation: 3,
    },
    buttonContainer: {
        width: '80%',
    },
    button: {
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
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Kanit_400Regular',
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
