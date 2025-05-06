import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { background_color } from "../../../GlobalStyles";
import { useRoute } from "@react-navigation/native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import AddToWorkoutModal from "./AddToWorkoutModal";

// Screen that displays an exercise's details and allows adding it to a workout
export default function ExerciseDescriptionScreen() {
    const route = useRoute();
    const exercise = route.params?.exercise;
    const [bottomModalVisible, setBottomModalVisible] = useState(false);

    (exercise);
    (exercise.exercise_name);

    return (
        <View style={styles.container}>
            {/* Bottom modal for workout selection */}
            <AddToWorkoutModal
                visible={bottomModalVisible}
                onClose={() => setBottomModalVisible(false)}
                exercise={exercise}
            />

            {/* Exercise name */}
            <Text style={styles.exerciseTitle}>{exercise.exercise_name}</Text>

            {/* Display muscle groups */}
            <View style={styles.muscleGroupContainer}>
                {exercise.muscle_groups.map((muscle_group, index) => (
                    <Text key={index} style={styles.muscleGroup}>
                        {muscle_group}
                    </Text>
                ))}
            </View>

            {/* Exercise instructions */}
            <Text style={styles.exerciseDescription}>{exercise.instructions}</Text>

            {/* Tips section (if available) */}
            {exercise.tips?.length > 0 && (
                <>
                    <Text style={styles.subheader}>Tips:</Text>
                    <View style={styles.divider}></View>
                    {exercise.tips.map((tip, index) => (
                        <Text key={index} style={styles.tip}>
                            ▹ {tip}
                        </Text>
                    ))}
                </>
            )}

            {/* Button to add to workout */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setBottomModalVisible(true)}
            >
                <Ionicons name="add-circle" size={24} color="white" />
                <Text style={styles.addButtonText}>Add to workout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: background_color
    },
    exerciseTitle: {
        color: 'white',
        fontSize: 40,
        fontWeight: 'bold',
        margin: 20,
        marginBottom: 10,
    },
    exerciseDescription: {
        color: 'white',
        fontSize: 25,
        marginHorizontal: 20,
        marginBottom: 1,
    },
    subheader: {
        color: 'white',
        fontSize: 25,
        fontWeight: 'bold',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
    },
    divider: {
        borderColor: 'white',
        borderWidth: 0.6,
        width: "90%",
        alignSelf: 'center',
        margin: 5,
    },
    tip: {
        color: 'white',
        fontSize: 20,
        marginLeft: 30,
        marginTop: 4,
        lineHeight: 26,
    },
    muscleGroupContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        marginTop: 10,
        marginHorizontal: 20,
        marginBottom: 15,
    },
    muscleGroup: {
        backgroundColor: "white",
        opacity: 0.7,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 'bold',
        color: "#333",
        marginRight: 6,
        marginBottom: 6,
    },
    addButton: {
        position: 'absolute',
        bottom: 110,
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
        fontSize: 15,
    },
});
