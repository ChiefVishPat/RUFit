/* CURRENTLY FIX ISSUES

import { BarCodeScanner } from 'expo-barcode-scanner';
import { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import TopHeader from '../../../components/TopHeader';
import { useRoute } from '@react-navigation/native';

export default function BarcodeScanner({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    // data is the barcode (UPC)
    const token = await getJWTToken(); // Get token from auth context or storage

    const res = await fetch('http://<your-flask-url>/api/scan-barcode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ barcode: data })
    });

    const json = await res.json();
    console.log('Scanned food data:', json);
    // You can show the food info or auto-log it
  };

  if (hasPermission === null) return <Text>Requesting permission...</Text>;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  return (
    <BarCodeScanner
      onBarCodeScanned={handleBarCodeScanned}
      style={{ flex: 1 }}
    />
  );
}

*/

/*
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

const MacroTrackerScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState(null);

  
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fiber, setFiber] = useState('');
  const [satFat, setSatFat] = useState('');
  const [unsatFat, setUnsatFat] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setBarcode(data);
    Alert.alert('Scanned!', `Barcode: ${data}`);
  };

  const handleSubmit = async () => {
    const token = 'your-jwt-token'; 

    const payload = {
      barcode: barcode || undefined,
      food_name: foodName || undefined,
      calories: parseFloat(calories) || undefined,
      protein: parseFloat(protein) || undefined,
      carbs: parseFloat(carbs) || undefined,
      fiber: parseFloat(fiber) || undefined,
      saturated_fats: parseFloat(satFat) || undefined,
      unsaturated_fats: parseFloat(unsatFat) || undefined,
    };

    try {
      const response = await fetch('http://localhost:5000/tracker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', data.message);
      } else {
        Alert.alert('Error', data.message || 'Failed to log macros.');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong');
      console.error(err);
    }
  };

  if (hasPermission === null) return <Text>Requesting camera access...</Text>;
  if (hasPermission === false) return <Text>No camera access</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Macro Tracker</Text>

      {!scanned && (
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={{ height: 200, width: '100%' }}
        />
      )}
      {scanned && <Button title="Scan Again" onPress={() => setScanned(false)} />}

      <TextInput placeholder="Food Name" value={foodName} onChangeText={setFoodName} style={styles.input} />
      <TextInput placeholder="Calories" keyboardType="numeric" value={calories} onChangeText={setCalories} style={styles.input} />
      <TextInput placeholder="Protein (g)" keyboardType="numeric" value={protein} onChangeText={setProtein} style={styles.input} />
      <TextInput placeholder="Carbs (g)" keyboardType="numeric" value={carbs} onChangeText={setCarbs} style={styles.input} />
      <TextInput placeholder="Fiber (g)" keyboardType="numeric" value={fiber} onChangeText={setFiber} style={styles.input} />
      <TextInput placeholder="Saturated Fat (g)" keyboardType="numeric" value={satFat} onChangeText={setSatFat} style={styles.input} />
      <TextInput placeholder="Unsaturated Fat (g)" keyboardType="numeric" value={unsatFat} onChangeText={setUnsatFat} style={styles.input} />

      <Button title="Submit Macros" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 20, marginBottom: 10 },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5
  }
});

export default MacroTrackerScreen;
*/

import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import { Camera } from 'expo-camera';

export default function ScanMacroScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    Alert.alert('Scanned!', `Barcode: ${data}`, [
      {
        text: 'OK',
        onPress: () => {
          navigation.navigate('Save Macro', { barcode: data });
        },
      },
    ]);
  };

  if (hasPermission === null) return <Text>Requesting camera permission...</Text>;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  return (
    <View style={styles.container}>
      <Camera
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
        ratio="16:9"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
