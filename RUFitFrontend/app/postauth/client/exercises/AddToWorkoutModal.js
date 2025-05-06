import { Animated, View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, FlatList, Alert, Modal, Pressable, Dimensions } from "react-native";
import { useState, useRef, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

export default function AddToWorkoutModal({ visible, onClose, exercise }) {

    (visible);
    const navigation = useNavigation();
    // (bottomModalVisible);

    const screenHeight = Dimensions.get('window').height;
    const modalHeight = screenHeight * 0.22; // Change this to customize modal height

    const [dimmedBackground, setDimmedBackground] = useState('transparent');

    useEffect(() => {
        if (!visible) {
            setDimmedBackground('transparent'); // reset when closing
            return;
        }

        const timeout = setTimeout(() => {
            setDimmedBackground('rgba(0,0,0,0.4)');
        }, 400);

        return () => clearTimeout(timeout);
    }, [visible]);

    const navigateNewWorkout = (exercise_name) => {
        const session = {
            "exercises": [
                {
                    "exercise": exercise_name,
                }
            ],
            "workout_name": "My Workout"
        }
        onClose();
        navigation.navigate('WorkoutNavigator', {
            screen: 'SaveWorkout',
            params: {
                session: session,
                autoFocusName: true,
                newWorkout: true
            },
        });
    }

    const navigateExistingWorkout = (exercise_name) => {
        const sessionAppend = {
            "exercises": [
                {
                    "exercise": exercise_name,
                }
            ],
        }
        onClose();
        navigation.navigate('WorkoutsModal', { sessionAppend: sessionAppend });
    }

    // SavedWorkoutsModal

    const styles = StyleSheet.create({
        openTrigger: {
            backgroundColor: '#1877F2',
            padding: 14,
            borderRadius: 10,
            margin: 20,
        },
        bar: {
            borderWidth: 1, borderColor: "gray", borderRadius: 5,
            height: 3, backgroundColor: "gray",
            opacity: 0.6,
            width: "40%",
            alignSelf: 'center',
            marginBottom: 18,
        },
        openText: {
            color: 'white',
            textAlign: 'center',
            fontWeight: '600',
            fontSize: 16,
        },
        modalBackdrop: {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: dimmedBackground, // no full screen dim
        },
        backdrop: {
            flex: 1,
            backgroundColor: dimmedBackground, // dim everything behind modal
            justifyContent: 'flex-end',         // push modal to bottom
        },
        modalContainer: {
            backgroundColor: '#1F1F1F',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            width: '100%',
        },

        modalButton: {
            backgroundColor: '#333',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginVertical: 8,
            width: '100%',
        },
        modalButtonText: {
            color: 'white',
            fontSize: 16,
            fontWeight: '600',
        },
    });

    return (
        <>
            <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
                {/* Dimmed background */}
                <Pressable style={styles.backdrop} onPress={onClose}>
                    {/* Modal content sits inside this */}
                    <View style={styles.modalContainer}>
                        <View style={styles.bar}></View>
                        <View style={styles.dragIndicator} />
                        <TouchableOpacity style={styles.modalButton}
                            onPress={() => navigateNewWorkout(exercise.exercise_name)}>
                            <Text style={styles.modalButtonText}>Add to new workout</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalButton}
                            onPress={() => navigateExistingWorkout(exercise.exercise_name)}>
                            <Text style={styles.modalButtonText}>Add to existing workout</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

        </>

    );
}


