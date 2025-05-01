import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

// Function to format weight (handles Bodyweight)
const formatWeight = (weight) => {
    return weight === 0 ? 'Bodyweight' : `${weight} LB`;
};


export default function RecommendationDetailModal({ isVisible, onClose, recommendations }) {
    // Don't render anything if not visible or no data (Modal handles visibility)
    if (!recommendations || Object.keys(recommendations).length === 0) {
        return null;
    }

    return (
        <Modal
            animationType="slide"
            transparent={false} // Non-transparent background
            visible={isVisible}
            onRequestClose={onClose} // Allows closing with back button on Android
        >
            {/* SafeAreaView for notches/status bars */}
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.modalContainer}>
                    {/* Simple Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Recommendations</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Scrollable Content */}
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {Object.entries(recommendations).map(([exerciseName, rec]) => (
                            <View key={exerciseName} style={styles.itemContainer}>
                                <Text style={styles.exerciseTitle}>{exerciseName}</Text>
                                <Text style={styles.detailText}>
                                    Target: {rec.sets} sets x {rec.reps} reps @ {formatWeight(rec.weight)}
                                </Text>
                                <Text style={styles.notesText}>Notes: {rec.notes}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

// Styles based on ClientHomeScreen.js and common modal patterns
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#1F1F1F', // Match ClientHomeScreen background
    },
    modalContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 15, // Padding for header content
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)', // Slightly more visible separator
    },
    headerTitle: {
        fontSize: 20, // Slightly larger title
        fontWeight: 'bold',
        color: '#fff', // White text
    },
    closeButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    closeButtonText: {
        fontSize: 16,
        color: '#CC0033', // Use app's accent color for close action
        fontWeight: '500',
    },
    scrollContent: {
        paddingVertical: 15,
        paddingHorizontal: 20, // Consistent horizontal padding
    },
    itemContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)', // Same subtle background as summary box
        borderRadius: 8, // Slightly smaller radius for items
        padding: 15,
        marginBottom: 15, // Space between items
    },
    exerciseTitle: {
        fontSize: 17, // Title for each exercise
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 15,
        color: '#eee', // Very light grey
        marginBottom: 5,
        lineHeight: 20, // Improve readability
    },
    notesText: {
        fontSize: 14,
        color: '#ccc', // Light grey for notes
        fontStyle: 'italic',
        lineHeight: 18,
    },
});