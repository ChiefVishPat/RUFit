import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import SavedWorkoutsScreen from "./SavedWorkoutsScreen";
import SaveWorkoutScreen from "./SaveWorkoutScreen";
import WorkoutDetailScreen from "./WorkoutDetailScreen";
import ScreenHeader from "./ScreenHeader";
import ModalHeader from "./ModalHeader";

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
                    header: () => <ScreenHeader title={"Workouts"} />
                }}

            />
            <Stack.Screen
                name="SaveWorkout"
                component={SaveWorkoutScreen}
                options={({ route }) => ({
                    title: route.params?.session ? 'Edit Workout' : 'New Workout',
                    gestureEnabled: false,
                    header: () => <ScreenHeader title={route.params?.session ? 'Edit Workout' : 'Add New Workout'} />,
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
                    header: () => <ModalHeader title={route.params?.session?.workout_name || "My Workout"}
                                                backButton={true}
                                  />,
                    headerBackTitle: 'Back',
                })}
            />
        </Stack.Navigator>
    );
}