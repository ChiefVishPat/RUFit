import { createStackNavigator } from "@react-navigation/stack";
import ScreenHeader from "../ScreenHeader";
import ModalHeader from "../ModalHeader";
import ExerciseDescriptionScreen from "./ExerciseDescriptionScreen";
import ExercisesListScreen from "./ExercisesListScreen";

// Stack navigator for navigating between the exercise list and individual exercise descriptions
export default function ExerciseNavigator() {
    const Stack = createStackNavigator();
    
    return (
        <Stack.Navigator
            initialRouteName="Exercises List"
            screenOptions={({ route }) => ({
                gestureEnabled: false,
            })}
        >
            <Stack.Screen
                name="Exercises List"
                component={ExercisesListScreen}
                options={{
                    title: 'Exercises',
                    gestureEnabled: false,
                    header: () => <ScreenHeader title={"Exercises"} />
                }}
            />
            <Stack.Screen
                name="Exercise Description"
                component={ExerciseDescriptionScreen}
                options={({ route }) => ({
                    title: route.params?.exercise?.exercise_name || 'Exercise',
                    gestureEnabled: false,
                    header: () => (
                        <ScreenHeader
                            title={route.params?.exercise?.exercise_name || 'Exercise'}
                            backButton={true}
                        />
                    ),
                    headerBackTitle: 'Back',
                })}
            />
        </Stack.Navigator>
    );
}
