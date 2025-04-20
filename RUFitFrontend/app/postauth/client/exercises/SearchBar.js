import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="#888" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Search exercises..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 12,
    margin: 20,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
});
