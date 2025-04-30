import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const CIRCLE_RADIUS = 60;
const STROKE_WIDTH = 20;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export default function WeeklyStreakProgress({ progress, goal }) {
    // console.log(progress);
    console.log(goal);
    // console.log(Math.min(Math.max(progress, 0), goal));
    const progressPercent = Math.min(Math.max(progress, 0), goal) / goal;
    const strokeDashoffset = CIRCUMFERENCE * (1 - progressPercent);

    return (
        <View style={styles.container}>
            <Svg width="100%" height="100%" viewBox="0 0 140 140">
                <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0%" stopColor="#CC0033" />
                        <Stop offset="100%" stopColor="darkred" />
                    </LinearGradient>
                </Defs>

                {/* Background circle */}
                <Circle
                    stroke="#e0e0e0"
                    fill="none"
                    cx="70"
                    cy="70"
                    r={CIRCLE_RADIUS}
                    strokeWidth={STROKE_WIDTH}
                />

                {/* Foreground progress with gradient */}
                <Circle
                    stroke="url(#grad)"
                    fill="none"
                    cx="70"
                    cy="70"
                    r={CIRCLE_RADIUS}
                    strokeWidth={STROKE_WIDTH}
                    strokeDasharray={`${CIRCUMFERENCE}, ${CIRCUMFERENCE}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 70 70)"
                />
            </Svg>

            <View style={styles.labelContainer}>
                <Text style={styles.progressText}>{progress}</Text>
                <Text style={styles.label}>Days</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
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
        color: 'white'
    },
    label: {
        fontSize: 14,
        color: 'white',
    },
});
