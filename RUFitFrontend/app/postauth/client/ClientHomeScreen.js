import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../../../components/ui/BottomNavBar'; // Import BottomNavBar
import TopHeader from '../../../components/TopHeader'; // Import TopHeader
import { APIClient } from '../../../components/api/APIClient';

export default function ClientHomeScreen() {
    
    return (
        <View style={styles.container}>
            {/* Reusable Header */}
            <TopHeader
                title="HOME"
                showBackButton={false}
                showShareButton={true}
            />

            {/* Performance Section */}
            <Text style={styles.performanceTitle}>Performance</Text>
            <View style={styles.performanceGrid}>
                <View style={[styles.card]}>
                    <Ionicons name="walk" size={40} color="white" />
                    <Text style={styles.cardValue}>456</Text>
                    <Text style={styles.cardLabel}>Steps</Text>
                </View>

                <View style={[styles.card]}>
                    <Ionicons name="flame" size={40} color="white" />
                    <Text style={styles.cardValue}>210</Text>
                    <Text style={styles.cardLabel}>Kcal</Text>
                </View>

                <View style={[styles.card]}>
                    <Ionicons name="heart" size={40} color="white" />
                    <Text style={styles.cardValue}>78</Text>
                    <Text style={styles.cardLabel}>bpm</Text>
                </View>

                <View style={[styles.card]}>
                    <Ionicons name="location" size={40} color="white" />
                    <Text style={styles.cardValue}>100 m</Text>
                    <Text style={styles.cardLabel}>Distance</Text>
                </View>
            </View>
        </View>
    );
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgb(67, 65, 65)',
        paddingTop: 50,
    },
    performanceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 20,
        marginTop: 10,
        color: 'white',
    },
    performanceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginTop: 10,
    },
    card: {
        width: '40%',
        aspectRatio: 1,
        margin: 10,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        backgroundColor: '#CC0033',
    },
    cardValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 5,
    },
    cardLabel: {
        fontSize: 16,
        color: 'white',
    },
});
