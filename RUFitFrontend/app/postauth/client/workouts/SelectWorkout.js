// Used by ExerciseDescriptionScreen.js (specifically, AddToWorkoutModal.js)
// Allows user to select a workout from saved workouts to add an exercise to

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { APIClient } from '../../../../components/api/APIClient';

export default function SelectWorkout() {
    const navigation = useNavigation();
    const route = useRoute();
    const [sessions, setSessions] = useState([]);
    const sessionAppend = route.params?.sessionAppend;

    // Fetch saved workouts from the backend
    const fetchWorkouts = async () => {
        try {
            const response = await APIClient.get('/workout', { sendAccess: true });
            setSessions(response.data);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                ('User not authorized, setting sessions to empty');
                setSessions([]);
            } else {
                console.error(error);
                Alert.alert('Error', 'Failed to fetch workouts.');
            }
        }
    };

    // Refresh data when the screen gains focus
    useFocusEffect(
        useCallback(() => {
            fetchWorkouts();
        }, [])
    );

    // Render a single workout card
    const renderWorkout = ({ item }) => (
        <TouchableOpacity
            style={styles.workoutCard}
            onPress={() => {
                navigation.navigate('SaveWorkoutModal', {
                    session: {
                        ...item,
                        exercises: [...item.exercises, ...sessionAppend.exercises],
                    },
                    isModal: true,
                });
            }}
        >
            <View>
                <Text style={styles.workoutName}>{item.workout_name}</Text>
                <Text style={styles.workoutDetails}>
                    {item.exercises ? item.exercises.length : 0} exercises • {item.date}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <FlatList
                    data={sessions}
                    keyExtractor={(item, index) =>
                        item.session_id || index.toString()
                    }
                    renderItem={renderWorkout}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <Text style={styles.emptyMessage}>
                            No saved workouts found.
                        </Text>
                    }
                />
            </View>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('SaveWorkout', { autoFocusName: true })}
            >
                <Ionicons name="add-circle" size={24} color="white" />
                <Text style={styles.addButtonText}>Add New Workout</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#1F1F1F',
    },
    container: {
        flex: 1,
        position: 'relative',
    },
    listContainer: {
        padding: 20,
        paddingBottom: 100,
    },
    workoutCard: {
        backgroundColor: '#333',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    workoutName: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    workoutDetails: {
        color: '#aaa',
        fontSize: 14,
    },
    cardActions: {
        flexDirection: 'row',
    },
    addButton: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#CC0033',
        padding: 20,
        borderRadius: 8,

        shadowColor: 'black',
        shadowOffset: { height: 1, width: 1 },
        shadowOpacity: 1,
        shadowRadius: 3,
        elevation: 2,
    },
    addButtonText: {
        color: 'white',
        marginLeft: 10,
        fontWeight: 'bold',
    },
    emptyMessage: {
        color: '#aaa',
        textAlign: 'center',
        marginTop: 100,
        fontSize: 16,
    },
});
