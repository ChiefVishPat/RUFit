import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SaveMacroScreen from './SaveMacroScreen';    // Screen for creating or editing a macro log, adding the macros   
import SavedMacroScreen from './SavedMacroScreen';   
import ScanMacroScreen from './ScanMacroScreen';       
import ScreenHeader from '../ScreenHeader';


//initializes the stack navigator which enables the compilation of these screens
const Stack = createStackNavigator();

//the component that handles all macro tracking related screens through the the use of stacknavigator
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
