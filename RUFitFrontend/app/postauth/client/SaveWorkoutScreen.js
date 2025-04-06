import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../../../components/BottomNavBar';
import TopHeader from '../../../components/TopHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import { APIClient } from '../../../components/api/APIClient';

export default function SaveWorkoutScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    // When editing, the existing session is passed as "session"
    const existingSession = route.params?.session;

    const [workoutName, setWorkoutName] = useState('');
    const [exercises, setExercises] = useState([
        { name: '', sets: '', reps: '', weight: '' },
    ]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (existingSession) {
            setWorkoutName(existingSession.workout_name);
            // Convert backend "exercise" key to "name" for the form
            const loadedExercises = existingSession.exercises.map((ex) => ({
                name: ex.exercise,
                sets: String(ex.sets),
                reps: String(ex.reps),
                weight: String(ex.weight),
            }));
            setExercises(loadedExercises);
        }
    }, [existingSession]);

    const handleAddExercise = () => {
        setExercises([
            ...exercises,
            { name: '', sets: '', reps: '', weight: '' },
        ]);
    };

    const handleExerciseChange = (index, field, value) => {
        const updatedExercises = [...exercises];
        updatedExercises[index][field] = value;
        setExercises(updatedExercises);
    };

    const handleRemoveExercise = (index) => {
        const updatedExercises = exercises.filter((_, i) => i !== index);
        setExercises(updatedExercises);
    };

    const handleSaveWorkout = async () => {
        if (!workoutName.trim()) {
            Alert.alert(
                'Validation Error',
                'Workout session name is required.'
            );
            return;
        }
        const validExercises = exercises.filter(
            (ex) => ex.name.trim() && ex.sets && ex.reps && ex.weight !== ''
        );
        if (validExercises.length === 0) {
            Alert.alert(
                'Validation Error',
                'At least one valid exercise is required.'
            );
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                workout_name: workoutName,
                exercises: validExercises,
            };
            let response;
            if (existingSession) {
                // Update the existing session using PUT with the session_id
                response = await APIClient.put(
                    `/workout/${existingSession.session_id}`,
                    payload
                );
            } else {
                // Create a new workout session
                response = await APIClient.post('/workout', payload);
            }
            console.log(response.data);
            Alert.alert('Success', 'Workout session saved successfully!');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save workout session.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TopHeader
                title={existingSession ? 'Edit Workout' : 'Save Workout'}
                showBackButton={true}
            />
            <ScrollView contentContainerStyle={styles.formContainer}>
                <Text style={styles.label}>Workout Session Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter workout session name"
                    placeholderTextColor="#aaa"
                    value={workoutName}
                    onChangeText={setWorkoutName}
                />
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Exercises</Text>
                {exercises.map((exercise, index) => (
                    <View key={index} style={styles.exerciseContainer}>
                        <View style={styles.exerciseRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter exercise name"
                                placeholderTextColor="#aaa"
                                value={exercise.name}
                                onChangeText={(value) =>
                                    handleExerciseChange(index, 'name', value)
                                }
                            />
                            <TouchableOpacity
                                onPress={() => handleRemoveExercise(index)}>
                                <Ionicons
                                    name="trash"
                                    size={24}
                                    color="#FF5E5E"
                                />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter number of sets"
                            placeholderTextColor="#aaa"
                            keyboardType="numeric"
                            value={exercise.sets}
                            onChangeText={(value) =>
                                handleExerciseChange(index, 'sets', value)
                            }
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter number of reps"
                            placeholderTextColor="#aaa"
                            keyboardType="numeric"
                            value={exercise.reps}
                            onChangeText={(value) =>
                                handleExerciseChange(index, 'reps', value)
                            }
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter weight (lbs) (optional)"
                            placeholderTextColor="#aaa"
                            keyboardType="numeric"
                            value={exercise.weight}
                            onChangeText={(value) =>
                                handleExerciseChange(index, 'weight', value)
                            }
                        />
                    </View>
                ))}
                <TouchableOpacity
                    style={styles.addExerciseButton}
                    onPress={handleAddExercise}>
                    <Ionicons name="add-circle" size={24} color="white" />
                    <Text style={styles.addExerciseButtonText}>
                        Add Exercise
                    </Text>
                </TouchableOpacity>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#2DC5F4" />
                ) : (
                    <TouchableOpacity
                        style={styles.saveWorkoutButton}
                        onPress={handleSaveWorkout}>
                        <Text style={styles.saveWorkoutButtonText}>
                            {existingSession
                                ? 'Update Workout'
                                : 'Save Workout'}
                        </Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            </ScrollView>
            <BottomNavBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1F1F1F' },
    formContainer: { padding: 20 },
    label: { color: 'white', fontSize: 16, marginBottom: 5 },
    input: {
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 5,
        color: 'white',
        marginBottom: 10,
    },
    divider: { height: 1, backgroundColor: '#555', marginVertical: 20 },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    exerciseContainer: {
        marginBottom: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#444',
        borderRadius: 5,
    },
    exerciseRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addExerciseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#CC0033',
        padding: 15,
        borderRadius: 5,
        marginBottom: 10,
    },
    addExerciseButtonText: {
        color: 'white',
        marginLeft: 10,
        fontWeight: 'bold',
    },
    saveWorkoutButton: {
        backgroundColor: '#CC0033',
        padding: 15,
        borderRadius: 5,
    },
    saveWorkoutButtonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    cancelButton: { marginTop: 10 },
    cancelButtonText: {
        color: '#FF5E5E',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});