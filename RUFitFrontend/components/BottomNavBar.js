import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function BottomNavBar() {
    const navigation = useNavigation();

    return (
        <View style={styles.bottomTab}>
            <TouchableOpacity
                style={styles.tabButton}
                onPress={() => navigation.navigate('ClientHomeScreen')}>
                <Ionicons name="home" size={24} color="white" />
                <Text style={styles.tabLabel}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.tabButton}
                onPress={() => navigation.navigate('Activity')}>
                <Ionicons name="barbell" size={24} color="white" />
                <Text style={styles.tabLabel}>Activity</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.tabButton}
                onPress={() => navigation.navigate('Macros')}>
                <Ionicons name="fast-food" size={24} color="white" />
                <Text style={styles.tabLabel}>Macros</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.tabButton}
                onPress={() => navigation.navigate('Exercises')}>
                <Ionicons name="fitness" size={24} color="white" />
                <Text style={styles.tabLabel}>Exercises</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.tabButton}
                onPress={() => navigation.navigate('Profile')}>
                <Ionicons name="person" size={24} color="white" />
                <Text style={styles.tabLabel}>Profile</Text>
            </TouchableOpacity>
        </View>
    );
}

// Styles for Navigation Bar
const styles = StyleSheet.create({
    bottomTab: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'black',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: '#000',
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    tabButton: {
        alignItems: 'center',
    },
    tabLabel: {
        color: 'white',
        fontSize: 12,
        marginTop: 2,
    },
});
