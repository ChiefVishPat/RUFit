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
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { useRef } from 'react';
import { APIClient } from '../../../../components/api/APIClient';

export default function SaveWorkoutScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    // When editing, an existing session is passed as "session"
    const existingSession = route.params?.session;
    const newWorkout = route.params?.newWorkout || false;

    // Detects whether screen is being presented as a modal (for navigation logic)
    const isModal = route.params?.isModal || false;

    // If param "autoFocusName" is passed as true, user is prompted to edit workout name first
    const nameInputRef = useRef(null);
    const autoFocusName = route.params?.autoFocusName ?? false;

    useEffect(() => {
        if (autoFocusName && nameInputRef.current) {
            const timeout = setTimeout(() => {
                nameInputRef.current.focus();

                // Optional: Move cursor to end if editing existing name
                if (workoutName) {
                    nameInputRef.current.setNativeProps({
                        selection: {
                            start: workoutName.length,
                            end: workoutName.length,
                        },
                    });
                }
            }, 300); // small delay to wait for UI to render

            return () => clearTimeout(timeout);
        }
    }, [autoFocusName]);

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
                name: ex?.exercise ?? '',
                sets: ex?.sets != null ? String(ex.sets) : '',
                reps: ex?.reps != null ? String(ex.reps) : '',
                weight: ex?.weight != null ? String(ex.weight) : '',
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

        // Updated validation: allow weight of 0 by checking if weight is not an empty string
        const validExercises = (exercises || []).filter(
            (ex) =>
                ex.name.trim() &&
                ex.sets &&
                ex.reps &&
                ex.weight !== '' &&
                ex.weight !== undefined &&
                ex.weight !== null
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
            if (existingSession && !newWorkout) {
                // Update the existing session using PUT with the session_id
                response = await APIClient.put(`/workout/${existingSession.session_id}`, payload, { sendAccess: true });
            } else {
                // Create a new workout session
                console.log("session id does not exist");
                response = await APIClient.post('/workout', payload, { sendAccess: true });
            }
            console.log(response.data);
            Alert.alert('Success', 'Workout session saved successfully!');

            if (isModal) {
                navigation.pop(2); // closes SaveWorkoutModal
                return;
            }
            else {
                navigation.goBack();
                return;
            }

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save workout session.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* <TopHeader
                title={existingSession ? 'Edit Workout' : 'Save Workout'}
                showBackButton={true}
            /> */}
            <ScrollView contentContainerStyle={styles.formContainer}>
                <Text style={styles.label}>Workout Session Name</Text>
                <TextInput
                    ref={nameInputRef}
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
                                ? 'Save Workout'
                                : 'Add New Workout'}
                        </Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1F1F1F',
        paddingTop: 15,
        paddingBottom: 90,
    },
    formContainer: {
        padding: 20,
    },
    label: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#333',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        color: '#fff',
        fontSize: 16,
        marginBottom: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#555',
        marginVertical: 20,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    exerciseContainer: {
        marginBottom: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: '#444',
        borderRadius: 10,
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
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { height: 1, width: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 2,
    },
    addExerciseButtonText: {
        color: '#fff',
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '600',
    },
    saveWorkoutButton: {
        backgroundColor: '#CC0033',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { height: 1, width: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 2,
    },
    saveWorkoutButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        marginTop: 10,
    },
    cancelButtonText: {
        color: '#FF5E5E',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
});
