import React, { useState } from 'react';
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
import BottomNavBar from '../../../components/BottomNavBar';
import TopHeader from '../../../components/TopHeader';

export default function SavedWorkoutsScreen({ navigation }) {
    const [workouts, setWorkouts] = useState([
        {
            id: '1',
            name: 'Full Body Workout',
            date: '2025-03-05',
            exercises: 5,
        },
        { id: '2', name: 'Upper Body Blast', date: '2025-03-04', exercises: 4 },
    ]);

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Workout',
            'Are you sure you want to delete this workout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: () => {
                        setWorkouts(
                            workouts.filter((workout) => workout.id !== id)
                        );
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
                navigation.navigate('WorkoutDetailScreen', {
                    workoutId: item.id,
                })
            }>
            <View>
                <Text style={styles.workoutName}>{item.name}</Text>
                <Text style={styles.workoutDetails}>
                    {item.exercises} exercises • {item.date}
                </Text>
            </View>

            <View style={styles.cardActions}>
                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate('SaveWorkoutScreen', {
                            workoutId: item.id,
                        })
                    }>
                    <Ionicons name="create" size={24} color="#2DC5F4" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
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
                    data={workouts}
                    keyExtractor={(item) => item.id}
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
                    onPress={() => navigation.navigate('SaveWorkoutScreen')}>
                    <Ionicons name="add-circle" size={24} color="white" />
                    <Text style={styles.addButtonText}>Add New Workout</Text>
                </TouchableOpacity>

                <BottomNavBar />
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
        paddingBottom: 100, // Ensures list is not covered by the button
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
        bottom: 80, // Positioned above the BottomNavBar
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2DC5F4',
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
