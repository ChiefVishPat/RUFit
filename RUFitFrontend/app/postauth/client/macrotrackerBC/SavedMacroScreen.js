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

export default function SavedMacroScreen() {
  const navigation = useNavigation();
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      const response = await APIClient.get('/tracker', {sendAccess: true});
      setLogs(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load macro logs.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [])
  );

  const handleDelete = async (id) => {
    Alert.alert('Delete Entry', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await APIClient.delete(`/tracker/${id}`, {sendAccess: true});
            fetchLogs();
          } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to delete entry.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Save Macro', { macro: item })}>
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
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No macros logged yet.</Text>}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('Save Macro', { autoFocusName: true })}>
        <Ionicons name="add-circle" size={24} color="white" />
        <Text style={styles.addButtonText}>Add Macro Entry</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1F1F1F' },
  listContainer: { padding: 20, paddingBottom: 100 },
  card: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  details: { color: '#aaa', fontSize: 14 },
  addButton: {
    position: 'absolute',
    bottom: 30,
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
  addButtonText: { color: 'white', marginLeft: 10, fontWeight: 'bold' },
  emptyText: { color: '#aaa', textAlign: 'center', marginTop: 100, fontSize: 16 },
});
