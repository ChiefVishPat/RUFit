import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { APIClient } from '../../../../components/api/APIClient';

export default function SaveMacroScreen() {
  //usenavigation is used to navigate between screens with 
  const navigation = useNavigation();
  const route = useRoute();
    // If this screen is opened to edit an existing macro log

  const existingMacro = route.params?.macro;

  // Form state holds all input values (populated if editing an existing entry)
  const [form, setForm] = useState({
    food_name: existingMacro?.food_name || '',
    barcode: existingMacro?.barcode || '',
    calories: existingMacro?.calories?.toString() || '',
    protein: existingMacro?.protein?.toString() || '',
    carbs: existingMacro?.carbs?.toString() || '',
    fiber: existingMacro?.fiber?.toString() || '',
    sat_fat: existingMacro?.sat_fat?.toString() || '',
    unsat_fat: existingMacro?.unsat_fat?.toString() || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (route.params?.barcode) {
      setForm((prev) => ({ ...prev, barcode: route.params.barcode }));
    }
  }, [route.params?.barcode]);

  // Handle field value changes
  const handleChange = (key, value) => setForm({ ...form, [key]: value });


  // Submit the data entered by users into the backend api for saving/storage
  const handleSubmit = async () => {
    // Ensure at least one identifier is provided
    if (!form.food_name && !form.barcode) {
      return Alert.alert('Validation Error', 'Food name or barcode is required.');
    }
    setIsLoading(true); //just to show user that loading is happening
    try {
      const payload = {
        ...form,
        calories: parseFloat(form.calories) || 0,
        protein: parseFloat(form.protein) || 0,
        carbs: parseFloat(form.carbs) || 0,
        fiber: parseFloat(form.fiber) || 0,
        sat_fat: parseFloat(form.sat_fat) || 0,
        unsat_fat: parseFloat(form.unsat_fat) || 0,
      };
      console.log("Submitting macro payload:", payload);

    // Send the macro data to the backend, and alerts when sucessful
      await APIClient.post('/tracker', payload, {sendAccess: true});
      Alert.alert('Success', 'Macro log saved.');
      navigation.goBack();
      
    } catch (err) {// Show error details in console and alert the user
      console.error("Error saving macro:", err.response?.data || err.message);
      Alert.alert('Error', 'Could not save macro log.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render labeled input fields
  const renderField = (label, key, keyboardType = 'default') => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={form[key]}
        onChangeText={(text) => handleChange(key, text)}
        keyboardType={keyboardType}
        placeholder={label}
        placeholderTextColor="#888"
      />
    </View>
  );

  return (
    //makes the fields a scrollable view for user
    <ScrollView contentContainerStyle={styles.container}>
      {renderField('Food Name', 'food_name')}
      {renderField('Barcode (optional)', 'barcode')}
      {renderField('Calories', 'calories', 'numeric')}
      {renderField('Protein (g)', 'protein', 'numeric')}
      {renderField('Carbs (g)', 'carbs', 'numeric')}
      {renderField('Fiber (g)', 'fiber', 'numeric')}
      {renderField('Saturated Fats (g)', 'sat_fat', 'numeric')}
      {renderField('Unsaturated Fats (g)', 'unsat_fat', 'numeric')}

      {/* Scan barcode button */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('Scan Macro')}
      >
        <Ionicons name="barcode-outline" size={24} color="white" />
        <Text style={styles.scanButtonText}>Scan Barcode</Text>
      </TouchableOpacity>

      {/* Submit or loading indicator */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#2DC5F4" />
      ) : (
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
          <Text style={styles.saveButtonText}>Save Macro</Text>
        </TouchableOpacity>
      )}

      {/* Cancel button */}
      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#1F1F1F', padding: 20, paddingBottom: 90 },
  inputGroup: { marginBottom: 15 },
  label: { color: '#aaa', marginBottom: 5 },
  input: {
    backgroundColor: '#333',
    color: 'white',
    borderRadius: 8,
    padding: 12,
  },
  saveButton: {
    backgroundColor: '#CC0033',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2DC5F4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  scanButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  saveButtonText: { color: 'white', fontWeight: 'bold' },
  cancelButton: { marginTop: 10 },
  cancelButtonText: { color: '#FF5E5E', textAlign: 'center', fontWeight: 'bold' },
});
