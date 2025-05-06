import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { APIClient } from '../../../../components/api/APIClient';

// Screen for displaying and managing saved macro logs
export default function SavedMacroScreen() {
  const navigation = useNavigation(); //used for navigation to different screens
  const [logs, setLogs] = useState([]); // State to hold macro log data from the backend

  // Function to retrieve macro logs from the server
  const fetchLogs = async () => {
    try {
      const response = await APIClient.get('/tracker', { sendAccess: true });
      setLogs(response.data); // Set the response data into local state
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load macro logs.');
    }
  };

  // Refetch macro logs every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchLogs(); // Refresh data on screen focus
    }, [])
  );

  // Handle deletion of a macro log entry
  const handleDelete = async (id) => {
    Alert.alert('Delete Entry', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' }, // Cancel option
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await APIClient.delete(`/tracker/${id}`, { sendAccess: true }); // API call to delete the log
            fetchLogs(); // Refresh list after deletion
          } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to delete entry.');
          }
        },
      },
    ]);
  };

  // Render a single log card with food info and delete option
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Save Macro', { macro: item })} // Navigate to edit screen
    >
      <View>
        <Text style={styles.foodName}>{item.food_name}</Text>
        <Text style={styles.details}>
          {item.calorie} kcal • {item.protein}g protein • {item.carbs}g carbs
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Ionicons name="trash" size={24} color="#FF5E5E" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Container wrapper (can be extended for future header or filters) */}
      <View style={styles.container} />

      {/* List of saved macro logs */}
      <FlatList
        data={logs} // Data source
        keyExtractor={(item) => item.id.toString()} // Unique key for each item
        renderItem={renderItem} // Render each card
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No macros logged yet.</Text> // Fallback text if no data
        }
      />

      {/* Button to add new macro entry */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('Save Macro', { autoFocusName: true })}
      >
        <Ionicons name="add-circle" size={24} color="white" />
        <Text style={styles.addButtonText}>Add Macro Entry</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Styles for screen layout and appearance
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1F1F1F', // Dark background
  },
  container: {
    paddingTop: 10, // Top padding for spacing
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100, // Leave space for add button
  },
  card: {
    backgroundColor: '#333', // Dark gray card background
    padding: 15,
    paddingVertical: 20,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row', // Align food info and delete button side by side
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  details: {
    color: '#aaa',
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    bottom: 110,
    left: 20,
    right: 20,
    flexDirection: 'row', // Icon + text side by side
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#CC0033', // Red button
    padding: 20,
    borderRadius: 8,
    shadowColor: 'black',
    shadowOffset: { height: 1, width: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2, // Android shadow
  },
  addButtonText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
});
