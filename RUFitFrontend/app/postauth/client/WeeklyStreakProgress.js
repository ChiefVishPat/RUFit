import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
    useAnimatedReaction,
    runOnJS,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';

const CIRCLE_RADIUS = 60;
const STROKE_WIDTH = 20;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Animated circular progress component to show weekly streak.
 * Animates progress from 0 to given `progress` relative to a `goal`.
 */
export default function WeeklyStreakProgress({ progress, goal }) {
    const [displayedProgress, setDisplayedProgress] = useState(0);
    const animatedProgress = useSharedValue(0);

    const progressPercent = goal > 0 ? Math.min(Math.max(progress, 0), goal) / goal : 0;

    // Animate progress bar when the screen is focused
    useFocusEffect(
        React.useCallback(() => {
            animatedProgress.value = 0;
            animatedProgress.value = withTiming(progressPercent, {
                duration: 1000,
                easing: Easing.out(Easing.ease),
            });
        }, [progressPercent])
    );

    // React to animation updates and update displayed text
    useAnimatedReaction(
        () => animatedProgress.value,
        (value) => {
            runOnJS(setDisplayedProgress)(Math.round(value * goal));
        },
        [goal]
    );

    // Animated stroke offset for circular progress
    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: CIRCUMFERENCE * (1 - animatedProgress.value),
    }));

    return (
        <View style={styles.container}>
            <Svg width="100%" height="100%" viewBox="0 0 140 140">
                <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0%" stopColor="#CC0033" />
                        <Stop offset="100%" stopColor="darkred" />
                    </LinearGradient>
                </Defs>

                {/* Base circle */}
                <Circle
                    stroke="#e0e0e0"
                    fill="none"
                    cx="70"
                    cy="70"
                    r={CIRCLE_RADIUS}
                    strokeWidth={STROKE_WIDTH}
                />

                {/* Animated progress circle */}
                {goal > 0 && (
                    <AnimatedCircle
                        stroke="url(#grad)"
                        fill="none"
                        cx="70"
                        cy="70"
                        r={CIRCLE_RADIUS}
                        strokeWidth={STROKE_WIDTH}
                        strokeDasharray={`${CIRCUMFERENCE}, ${CIRCUMFERENCE}`}
                        animatedProps={animatedProps}
                        strokeLinecap="round"
                        transform="rotate(-90 70 70)"
                    />
                )}
            </Svg>

            {/* Text label in center of circle */}
            <View style={styles.labelContainer}>
                <Text style={styles.progressText}>{displayedProgress}</Text>
                <Text style={styles.label}>{displayedProgress === 1 ? 'Day' : 'Days'}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '80%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    labelContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    progressText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: 'white',
    },
    label: {
        fontSize: 14,
        color: 'white',
    },
});
