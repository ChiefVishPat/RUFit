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
import TopHeader from '../../../components/TopHeader';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { APIClient } from '../../../components/api/APIClient';

export default function SavedWorkoutsScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const [sessions, setSessions] = useState([]);

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

    const handleDelete = async (session_id) => {
        Alert.alert(
            'Delete Workout',
            'Are you sure you want to delete this workout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            await APIClient.delete(`/workout/${session_id}`);
                            setSessions(
                                sessions.filter(
                                    (session) =>
                                        session.session_id !== session_id
                                )
                            );
                        } catch (error) {
                            console.error(error);
                            Alert.alert('Error', 'Failed to delete workout.');
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    const renderWorkout = ({ item }) => (
        <TouchableOpacity
            style={styles.workoutCard}
            onPress={() =>
                navigation.navigate('AuthenticatedWorkoutDetailScreen', {
                    session: item,
                })
            }>
            <View>
                <Text style={styles.workoutName}>{item.workout_name}</Text>
                <Text style={styles.workoutDetails}>
                    {item.exercises ? item.exercises.length : 0} exercises •{' '}
                    {item.date}
                </Text>
            </View>
            <View style={styles.cardActions}>
                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate('AuthenticatedSaveWorkoutScreen', {
                            session: item,
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
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <TopHeader title="Saved Workouts" showBackButton={true} />
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
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() =>
                        navigation.navigate('AuthenticatedSaveWorkoutScreen')
                    }>
                    <Ionicons name="add-circle" size={24} color="white" />
                    <Text style={styles.addButtonText}>Add New Workout</Text>
                </TouchableOpacity>
            </View>
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
        bottom: 80,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#CC0033',
        padding: 15,
        borderRadius: 8,
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