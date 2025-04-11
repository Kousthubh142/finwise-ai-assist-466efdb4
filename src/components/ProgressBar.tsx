
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number;
  height?: number;
  backgroundColor?: string;
  borderRadius?: number;
  progressColor?: string | ((progress: number) => string);
  showPercentage?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 12,
  backgroundColor = '#E5E7EB',
  borderRadius = 6,
  progressColor,
  showPercentage = false,
  label,
}) => {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  // Determine the color based on progress if a function is provided
  const getProgressColor = (): string => {
    if (typeof progressColor === 'function') {
      return progressColor(clampedProgress);
    }
    
    if (progressColor) {
      return progressColor;
    }
    
    // Default color logic based on percentage
    if (clampedProgress < 70) {
      return '#8B5CF6'; // Primary color (purple)
    } else if (clampedProgress < 90) {
      return '#F59E0B'; // Warning (amber)
    } else {
      return '#EF4444'; // Danger (red)
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {showPercentage && (
            <Text style={styles.percentage}>{clampedProgress.toFixed(0)}%</Text>
          )}
        </View>
      )}
      
      <View
        style={[
          styles.progressBackground,
          {
            height,
            backgroundColor,
            borderRadius,
          },
        ]}
      >
        <View
          style={[
            styles.progressFill,
            {
              width: `${clampedProgress}%`,
              height: '100%',
              backgroundColor: getProgressColor(),
              borderRadius,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  progressBackground: {
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
});
