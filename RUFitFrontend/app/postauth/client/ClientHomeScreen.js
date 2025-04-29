import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { APIClient } from '../../../components/api/APIClient';
import { background_color } from '../../GlobalStyles';

export default function ClientHomeScreen() {

    const route = useRoute();

    const [streak, setStreak] = useState(null);
    const [loading, setLoading] = useState(true);

    const userData = route.params?.userData;


    useEffect(() => {
        const fetchStreak = async () => {
            try {
                const response = await APIClient.get('/workout/streak', { sendAccess: true });
            setStreak(response.data.streak);
            setLoading(false);
            }
            catch(error){
                console.error(error);
            }
        }

        fetchStreak();
    }, []);

    if (loading) {
        return <ActivityIndicator style={styles.loader} />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.welcomeBanner}>
                <Text style={styles.greeting}>Welcome back, {userData.username}!</Text>
            </View>

            <Text style={styles.streak}>🔥 Current Streak: {streak} day{streak !== 1 ? 's' : ''}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: background_color,
        borderColor: "white",
        borderWidth: 2,
    },
    welcomeBanner: {
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: "white",
        borderWidth: 2,
        marginTop: 40,
    },
    greeting: {
        fontSize: 38,
        fontWeight: '600',
        marginBottom: 12,
        color: "white",
    },
    streak: {
        fontSize: 20,
        color: '#ff6347',
        fontWeight: "bold",
        marginTop: 20,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
    },
});
