import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from "react-native"
import { global_styles } from "../../GlobalStyles";
import {
    useFonts,
    BigShouldersDisplay_700Bold,
} from '@expo-google-fonts/big-shoulders-display';
import { Kanit_400Regular } from '@expo-google-fonts/kanit';

const BodyDataScreen = ({ navigation, route }) => {
    const [fontsLoaded] = useFonts({
        BigShouldersDisplay_700Bold,
        Kanit_400Regular,
    });
    const { email, username, password } = route.params;

    if (!fontsLoaded) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={global_styles.screenContainer}>
            <View style={styles.topText}>
                <Text style={styles.screenTitle}>Welcome to RUFit, {username}</Text>
                <Text style={styles.subText}>hi</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    topText: {
        flex: 1,
        flexDirection: 'column',
        width: Dimensions.get('screen').width * 0.9,
        margin: 50,
        borderColor: 'pink',
        borderWidth: 1
    },
    screenTitle: {
        //transform: [{ translateY: Dimensions.get('screen').height * -0.32 }],
        fontSize: 45,
        fontFamily: 'Kanit_400Regular',
        color: 'white',
        alignSelf: 'center',

        borderColor: 'red',
        borderWidth: 1
    },
    subText: {
        //transform: [{ translateY: Dimensions.get('screen').height * -0.3 }],
        alignSelf: 'flex-start',
        marginTop: 20,
        fontSize: 30,
        fontFamily: 'Kanit_400Regular',
        color: 'white',
    }
})

export default BodyDataScreen;