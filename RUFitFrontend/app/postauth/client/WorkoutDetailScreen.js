import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import TopHeader from '../../../components/TopHeader';
import { useRoute } from '@react-navigation/native';

export default function WorkoutDetailScreen() {
    const route = useRoute();
    const session = route.params?.session;

    if (!session) {
        return (
            <View style={styles.container}>
                {/* <TopHeader title="Workout Details" showBackButton={true} /> */}
                
                <Text style={styles.error}>No workout details available.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* <TopHeader title="Workout Details" showBackButton={true} /> */}
            
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <Text style={styles.workoutName}>{session.workout_name}</Text>
                <Text style={styles.date}>{session.date}</Text>
                <Text style={styles.sectionTitle}>Exercises</Text>
                {session.exercises.map((ex, index) => (
                    <View key={index} style={styles.exerciseContainer}>
                        <Text style={styles.exerciseText}>
                            {ex.exercise} – {ex.sets} sets x {ex.reps} reps,{' '}
                            {ex.weight} lbs
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1F1F1F' },
    contentContainer: { padding: 20, paddingBottom: 100 },
    workoutName: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    date: { color: '#aaa', fontSize: 16, marginBottom: 15 },
    sectionTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 10,
    },
    exerciseContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#444',
    },
    exerciseText: { color: 'white', fontSize: 16 },
    error: { color: 'red', textAlign: 'center', marginTop: 50, fontSize: 18 },
});