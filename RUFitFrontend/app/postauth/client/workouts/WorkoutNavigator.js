import { createStackNavigator } from "@react-navigation/stack";
import SavedWorkoutsScreen from "./SavedWorkoutsScreen";
import SaveWorkoutScreen from "./SaveWorkoutScreen";
import WorkoutDetailScreen from "./WorkoutDetailScreen";
import ScreenHeader from "../ScreenHeader";
import ModalHeader from "../ModalHeader";

/**
 * Stack navigator for handling workout-related screens:
 * - Viewing saved workouts
 * - Saving a new or edited workout
 * - Viewing workout details in a modal
 */
export default function WorkoutNavigator() {
    const Stack = createStackNavigator();

    return (
        <Stack.Navigator
            initialRouteName="Workouts"
            screenOptions={{ gestureEnabled: false }}
        >
            <Stack.Screen
                name="Workouts"
                component={SavedWorkoutsScreen}
                options={{
                    title: 'Workouts',
                    headerTitle: 'Workouts',
                    header: () => <ScreenHeader title="Workouts" />
                }}
            />
            <Stack.Screen
                name="SaveWorkout"
                component={SaveWorkoutScreen}
                options={({ route }) => ({
                    title: route.params?.session ? 'Edit Workout' : 'New Workout',
                    header: () => (
                        <ScreenHeader
                            title={route.params?.session ? 'Edit Workout' : 'Add New Workout'}
                        />
                    ),
                    headerBackTitle: 'Back',
                })}
            />
            <Stack.Screen
                name="ViewWorkout"
                component={WorkoutDetailScreen}
                options={({ route }) => ({
                    presentation: "modal",
                    title: route.params?.session?.workout_name || "My Workout",
                    gestureEnabled: true,
                    header: () => (
                        <ModalHeader
                            title={route.params?.session?.workout_name || "My Workout"}
                            backButton={true}
                        />
                    ),
                    headerBackTitle: 'Back',
                })}
            />
        </Stack.Navigator>
    );
}
