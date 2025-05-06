import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SaveMacroScreen from './SaveMacroScreen';
import SavedMacroScreen from './SavedMacroScreen';
import ScanMacroScreen from './ScanMacroScreen';
import ScreenHeader from '../ScreenHeader';

const Stack = createStackNavigator();

// Navigator for macro tracking: viewing logs, saving entries, and scanning barcodes
export default function MacroTrackerNavigator() {
  return (
    <Stack.Navigator initialRouteName="Macro Logs">
      <Stack.Screen
        name="Macro Logs"
        component={SavedMacroScreen}
        options={{
          header: () => <ScreenHeader title="Macro Logs" />
        }}
      />
      <Stack.Screen
        name="Save Macro"
        component={SaveMacroScreen}
        options={{
          header: () => <ScreenHeader title="Add Macro Log" backButton={true} />
        }}
      />
      <Stack.Screen
        name="Scan Macro"
        component={ScanMacroScreen}
        options={{
          header: () => <ScreenHeader title="Scan Barcode" backButton={true} />
        }}
      />
    </Stack.Navigator>
  );
}
