import { useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { View, StyleSheet, Text, Dimensions } from "react-native";
import ModalAlert from "../../../components/ui/alerts/ModalAlert";
import { get_user_profile } from "../../../components/user_data/UserProfileRequests";
import { GradientScreen } from "../../GlobalStyles"

export default function ClientProfileScreen() {
    const route = useRoute();
    const userData = route.params.userData;
    
    return (
        <GradientScreen>
            <View style={styles.container}>

                <View style={styles.welcomeTitle}>
                    <Text style={styles.welcomeText}>Hello, {userData.username}!</Text>
                </View>
                <View style={styles.headerCard}></View>

                <View style={styles.profileOptionsContainer}>
                    
                    <View style={styles.profileOptionCard}>
                        <Text style={styles.optionText}>Option 1</Text>
                    </View>
                    
                    <View style={styles.profileOptionCard}>
                        <Text style={styles.optionText}>Option 2</Text>
                    </View>
                    
                    <View style={styles.profileOptionCard}>
                        <Text style={styles.optionText}>Option 3</Text>
                    </View>
                    
                    <View style={styles.profileOptionCard}></View>
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
        marginTop: 40,
        width: Dimensions.get('window').width * 0.9,
        borderColor: 'white',
        borderWidth:2,
    },
    welcomeTitle:{
        height: 80,
        marginHorizontal: 20,
        marginBottom: 30,
        width: Dimensions.get('window').width * 0.8,
        justifyContent: 'center',
        borderColor: 'white',
        borderWidth: 0.5,
        borderRadius: 20,
    },
    welcomeText:{
        fontSize: 30,
        color: 'white',
        fontWeight: 'bold',
        alignSelf: 'center',
    },
    profileOptionCard:{
        height: 80,
        marginHorizontal: 20,
        marginBottom: 30,
        width: Dimensions.get('window').width * 0.8,
        justifyContent: 'center',
        borderColor: 'white',
        borderWidth: 0.5,
        borderRadius: 20,
    },
    optionText:{
        fontSize: 30,
        color: 'white',
    }
});