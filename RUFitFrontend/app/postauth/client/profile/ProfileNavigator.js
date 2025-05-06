import { createStackNavigator } from "@react-navigation/stack";
import ScreenHeader from "../ScreenHeader";

import ClientProfileScreen from "./ClientProfileScreen";
import MyBodyDataScreen from "./MyBodyData";
import AccountSettingsScreen from "./AccountSettings";
import ProfileSettingsScreen from "./ProfileSettings";
import { useRoute } from "@react-navigation/native"; // useNavigation removed (unused)

// Stack navigator for profile-related screens
export default function ProfileNavigator() {
    const Stack = createStackNavigator();
    const route = useRoute();

    const userData = route.params?.userData;
    (userData);

    return (
        <Stack.Navigator
            initialRouteName="ClientProfileScreen"
            screenOptions={{
                gestureEnabled: false,
            }}
        >
            {/* Main profile screen */}
            <Stack.Screen
                name="ClientProfileScreen"
                initialParams={{ userData }}
                component={ClientProfileScreen}
                options={{
                    title: 'Profile',
                    headerShown: false,
                    gestureEnabled: false,
                }}
            />
            {/* Subscreens */}
            <Stack.Screen
                name="MyBodyData"
                component={MyBodyDataScreen}
                options={{
                    title: 'My Body Data',
                    headerShown: false,
                    gestureEnabled: true,
                }}
            />
            <Stack.Screen
                name="AccountSettings"
                component={AccountSettingsScreen}
                options={{
                    title: 'Account Settings',
                    headerShown: false,
                    gestureEnabled: true,
                }}
            />
            <Stack.Screen
                name="ProfileSettings"
                component={ProfileSettingsScreen}
                options={{
                    title: 'Profile Settings',
                    headerShown: false,
                    gestureEnabled: true,
                }}
            />
        </Stack.Navigator>
    );
}
