
// used by ExerciseDescriptionScreen.js (more specifically, AddToWorkoutModal.js component)
// so user can select a workout from all workouts to add exercise to

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
import TopHeader from '../../../../components/TopHeader';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { APIClient } from '../../../../components/api/APIClient';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthenticatedSavedWorkoutsScreen, AuthenticatedSaveWorkoutScreen } from '../../../../components/authentication/AuthenticatedScreens';

export default function SelectWorkout() {
    const navigation = useNavigation();
    const route = useRoute();
    const [sessions, setSessions] = useState([]);
    const sessionAppend = route.params?.sessionAppend;

    const fetchWorkouts = async () => {
        try {
            const response = await APIClient.get('/workout');
            // Assume backend returns grouped sessions with session_id, workout_name, date, exercises
            setSessions(response.data);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('User not authorized, setting sessions to empty');
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

    const renderWorkout = ({ item }) => (
        <TouchableOpacity
            style={styles.workoutCard}
            onPress={() =>
                navigation.navigate('SaveWorkoutModal', {
                    session: {
                        ...item,
                        exercises: [...item.exercises, ...sessionAppend.exercises],
                    }, // should be session append
                    isModal: true
                })
            }>
            <View>
                <Text style={styles.workoutName}>{item.workout_name}</Text>
                <Text style={styles.workoutDetails}>
                    {item.exercises ? item.exercises.length : 0} exercises •{' '}
                    {item.date}
                </Text>
            </View>
            {/*
            <View style={styles.cardActions}>
                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate('SaveWorkout', {

                        })
                    }>
                    <Ionicons name="create" size={24} color="#2DC5F4" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.session_id)}>
                    <Ionicons
                        name="trash"
                        size={24}
                        color="#FF5E5E"
                        style={{ marginLeft: 10 }}
                    />
                </TouchableOpacity>
            </View>
            */}
            
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* <TopHeader title="Saved Workouts" showBackButton={true} /> */}

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
                onPress={() => navigation.navigate('SaveWorkout', { autoFocusName: true })}>
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
        paddingBottom: 100, // Extra space for the add button
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

        shadowColor: 'black', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 3, //IOS
        elevation: 2, // Android
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