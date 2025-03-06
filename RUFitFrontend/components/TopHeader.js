import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function TopHeader({
    title,
    showBackButton = false,
    showShareButton = false,
}) {
    const navigation = useNavigation(); // Enables navigation actions

    return (
        <View style={styles.header}>
            {/* Back Button (Optional) */}
            {showBackButton ? (
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
            ) : (
                <View style={styles.iconButtonPlaceholder} />
            )}

            {/* Centered Title */}
            <Text style={styles.headerText}>{title}</Text>
        </View>
    );
}

// Styles
const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Keeps buttons and title spaced properly
        backgroundColor: '#000',
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        flex: 1,
    },
    iconButton: {
        padding: 10,
    },
    iconButtonPlaceholder: {
        width: 44,
    },
});
