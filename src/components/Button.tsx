
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon
}) => {
  const getButtonStyles = () => {
    let variantStyle: ViewStyle = {};
    let textColor: string = '#FFFFFF';
    
    switch (variant) {
      case 'primary':
        variantStyle = { backgroundColor: '#8B5CF6' };
        textColor = '#FFFFFF';
        break;
      case 'secondary':
        variantStyle = { backgroundColor: '#E5E7EB' };
        textColor = '#374151';
        break;
      case 'outline':
        variantStyle = { 
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: '#8B5CF6' 
        };
        textColor = '#8B5CF6';
        break;
      case 'ghost':
        variantStyle = { backgroundColor: 'transparent' };
        textColor = '#8B5CF6';
        break;
    }
    
    let sizeStyle: ViewStyle = {};
    let textSize: number = 16;
    
    switch (size) {
      case 'small':
        sizeStyle = { paddingVertical: 6, paddingHorizontal: 12 };
        textSize = 14;
        break;
      case 'medium':
        sizeStyle = { paddingVertical: 10, paddingHorizontal: 16 };
        textSize = 16;
        break;
      case 'large':
        sizeStyle = { paddingVertical: 14, paddingHorizontal: 24 };
        textSize = 18;
        break;
    }
    
    if (disabled) {
      variantStyle = {
        ...variantStyle,
        opacity: 0.5,
      };
    }
    
    return {
      button: {
        ...styles.button,
        ...variantStyle,
        ...sizeStyle,
        ...style,
      },
      text: {
        ...styles.text,
        color: textColor,
        fontSize: textSize,
        ...textStyle,
      }
    };
  };

  const buttonStyles = getButtonStyles();

  return (
    <TouchableOpacity
      style={buttonStyles.button}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#FFFFFF' : '#8B5CF6'} 
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={buttonStyles.text}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '600',
  }
});
