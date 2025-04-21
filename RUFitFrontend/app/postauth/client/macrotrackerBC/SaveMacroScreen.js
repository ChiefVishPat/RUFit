import React, { useState } from 'react';
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
import { useEffect } from 'react';

export default function SaveMacroScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const existingMacro = route.params?.macro;

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
  if (route.params?.scannedBarcode) {
    setForm((prev) => ({ ...prev, barcode: route.params.scannedBarcode }));
  }
}, [route.params?.scannedBarcode]); 

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async () => {
    if (!form.food_name && !form.barcode) {
      return Alert.alert('Validation Error', 'Food name or barcode is required.');
    }
    setIsLoading(true);
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
      await APIClient.post('/tracker', payload);
      Alert.alert('Success', 'Macro log saved.');
      navigation.goBack();
    } catch (err) {
      console.error("Error saving macro:", err.response?.data || err.message);
      Alert.alert('Error', 'Could not save macro log.');
    } finally {
      setIsLoading(false);
    }
  };

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
    <ScrollView contentContainerStyle={styles.container}>
      {renderField('Food Name', 'food_name')}
      {renderField('Barcode (optional)', 'barcode')}
      {renderField('Calories', 'calories', 'numeric')}
      {renderField('Protein (g)', 'protein', 'numeric')}
      {renderField('Carbs (g)', 'carbs', 'numeric')}
      {renderField('Fiber (g)', 'fiber', 'numeric')}
      {renderField('Saturated Fats (g)', 'sat_fat', 'numeric')}
      {renderField('Unsaturated Fats (g)', 'unsat_fat', 'numeric')}
     
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('Scan Macro')}
      >
        <Ionicons name="barcode-outline" size={24} color="white" />
        <Text style={styles.scanButtonText}>Scan Barcode</Text>
      </TouchableOpacity>

      {isLoading ? (
        <ActivityIndicator size="large" color="#2DC5F4" />
      ) : (
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
          <Text style={styles.saveButtonText}>Save Macro</Text>
        </TouchableOpacity>
      )}


      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#1F1F1F', padding: 20, paddingBottom: 80 },
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


