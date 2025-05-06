import { useNavigation } from '@react-navigation/native'; // For navigating between screens
import { GradientScreen } from '../GlobalStyles'; // Custom gradient wrapper
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import {
    useFonts,
    BigShouldersDisplay_700Bold,
} from '@expo-google-fonts/big-shoulders-display';
import { Kanit_400Regular } from '@expo-google-fonts/kanit';

export default function PreAuthLandingPage() {
    // Load custom fonts
    const [fontsLoaded] = useFonts({
        BigShouldersDisplay_700Bold,
        Kanit_400Regular,
    });

    const navigation = useNavigation(); // Navigation hook
    const RutgersLogo = require('../../assets/images/rufit_logo.png');

    // Get device dimensions
    const screenHeight = Dimensions.get('window').height;
    const screenWidth = Dimensions.get('window').width;

    // Maintain logo aspect ratio
    const logoWidth = screenWidth * 0.8;
    const logoHeight = (910 / 2503) * logoWidth;

    // Show loading spinner while fonts load
    if (!fontsLoaded) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <GradientScreen>
            {/* Logo & App Name Section */}
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

            {/* Login and Sign Up Buttons */}
            <View
                style={[
                    styles.buttonContainer,
                    { marginTop: screenHeight * 0.3 },
                ]}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('LoginScreen')}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('SignupScreen')}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </GradientScreen>
    );
}

// Component styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#84888C',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
    buttonContainer: {
        width: '80%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '5%',
    },
    button: {
        backgroundColor: '#CC0033',
        paddingVertical: 15,
        borderRadius: 8,
        marginBottom: 15,
        width: '100%',
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
