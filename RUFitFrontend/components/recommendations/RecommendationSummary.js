import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

// Function to format weight (handles Bodyweight)
const formatWeight = (weight) => {
    return weight === 0 ? 'BW' : `${weight} LB`;
};

// Limit the number of items shown in summary
const MAX_SUMMARY_ITEMS = 3;

export default function RecommendationSummary({ recommendations, onPress, isLoading, error }) {
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.loadingText}>Loading Recommendations...</Text>
            </View>
        );
    }

    if (error) {
        return <Text style={styles.errorText}>{error}</Text>;
    }

    if (!recommendations || Object.keys(recommendations).length === 0) {
        return <Text style={styles.infoText}>No recommendations available yet.</Text>;
    }

    // Get the first few exercise names
    const exerciseNames = Object.keys(recommendations).slice(0, MAX_SUMMARY_ITEMS);
    const totalExercises = Object.keys(recommendations).length;

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.touchableContainer}>
        {exerciseNames.map((exerciseName) => {
                const rec = recommendations[exerciseName];
                // Add checks for potentially missing recommendation details
                const sets = rec?.sets ?? '?'; // Use '??' for nullish coalescing (defaults if null or undefined)
                const reps = rec?.reps ?? '?';
                const weightDisplay = (rec?.weight !== undefined && rec?.weight !== null) ? formatWeight(rec.weight) : 'N/A'; // Check weight specifically

                return (
                    <View key={exerciseName} style={styles.row}>
                        <Text style={styles.exerciseName}>{exerciseName}</Text>
                        <Text style={styles.detailsText}>
                            {sets}x{reps} @ {weightDisplay}
                        </Text>
                    </View>
                );
            })}
            {totalExercises > MAX_SUMMARY_ITEMS && (
                <Text style={styles.moreText}>...and {totalExercises - MAX_SUMMARY_ITEMS} more (Tap to view)</Text>
            )}
            {totalExercises <= MAX_SUMMARY_ITEMS && totalExercises > 0 && (
                 <Text style={styles.moreText}>Tap to view details</Text>
            )}
        </TouchableOpacity>
    );
}

// Styles based on ClientHomeScreen.js patterns
const styles = StyleSheet.create({
    touchableContainer: {
        marginHorizontal: 20, // Match performanceGrid padding
        marginTop: 15,
        marginBottom: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.08)', // Subtle background like profile cards potentially use elsewhere
        borderRadius: 10, // Rounded corners
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8, // Vertical padding for rows
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.15)', // Subtle separator
    },
    exerciseName: {
        color: '#fff', // White text
        fontSize: 15,
        fontWeight: '500', // Medium weight
        flex: 1, // Allow text to wrap if needed
        marginRight: 10,
    },
    detailsText: {
        color: '#ccc', // Lighter grey text for details
        fontSize: 14,
    },
    moreText: {
        color: '#aaa', // Dimmer grey text
        fontSize: 13,
        textAlign: 'center',
        marginTop: 10,
        fontStyle: 'italic',
    },
    loadingContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    loadingText: {
        color: '#fff',
        marginTop: 5,
        fontSize: 14,
    },
    errorText: {
        color: '#ff8a8a', // Light red for errors
        fontSize: 14,
        textAlign: 'center',
        marginHorizontal: 20,
        marginTop: 15,
        marginBottom: 10,
    },
     infoText: {
        color: '#ccc', // Light grey for info
        fontSize: 14,
        textAlign: 'center',
        marginHorizontal: 20,
        marginTop: 15,
        marginBottom: 10,
        fontStyle: 'italic',
    }
});