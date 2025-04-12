import { createStackNavigator } from "@react-navigation/stack";
import SavedWorkoutsScreen from "./SavedWorkoutsScreen";
import SaveWorkoutScreen from "./SaveWorkoutScreen";
import ClientHeader from "./ClientHeader";

export default function WorkoutNavigator() {
    const Stack = createStackNavigator();
    return (
        <Stack.Navigator initialRouteName="Workouts"
            screenOptions={({ route }) => ({
                gestureEnabled: false,
            })}>
            <Stack.Screen
                name="Workouts"
                component={SavedWorkoutsScreen}
                options={{
                    title: 'Workouts',
                    headerTitle: 'Workouts',
                    gestureEnabled: false,
                    header: () => <ClientHeader title={"Workouts"} />
                }}

            />
            <Stack.Screen
                name="SaveWorkout"
                component={SaveWorkoutScreen}
                options={({ route }) => ({
                    title: route.params?.session ? 'Edit Workout' : 'New Workout',
                    gestureEnabled: false,
                    header: () => <ClientHeader title={route.params?.session ? 'Edit Workout' : 'Add New Workout'} />,
                    headerBackTitle: 'Back',
                })}
            />
        </Stack.Navigator>
    );
}