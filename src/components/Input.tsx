
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  multiline?: boolean;
  numberOfLines?: number;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  label,
  placeholder,
  secureTextEntry = false,
  error,
  disabled = false,
  style,
  inputStyle,
  keyboardType = 'default',
  leftIcon,
  rightIcon,
  onRightIconPress,
  multiline = false,
  numberOfLines = 1
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'mail':
        return <Mail className="h-5 w-5 text-gray-400" />;
      case 'lock':
        return <Lock className="h-5 w-5 text-gray-400" />;
      case 'user':
        return <User className="h-5 w-5 text-gray-400" />;
      default:
        return null;
    }
  };

  // Convert leftIcon from string to component if needed
  const leftIconComponent = typeof leftIcon === 'string' 
    ? getIconForType(leftIcon as string) 
    : leftIcon;

  return (
    <div className="mb-4" style={style}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div 
        className={cn(
          "relative flex items-center border rounded-md overflow-hidden",
          isFocused ? "border-primary ring-1 ring-primary" : "border-gray-300",
          error ? "border-red-500" : "",
          disabled ? "bg-gray-100 opacity-70" : "bg-white"
        )}
      >
        {leftIconComponent && (
          <div className="pl-3">
            {leftIconComponent}
          </div>
        )}
        
        <input
          className={cn(
            "w-full px-3 py-2 outline-none text-gray-800",
            leftIconComponent ? "pl-2" : "",
            (rightIcon || secureTextEntry) ? "pr-10" : "",
            multiline ? "h-auto" : "h-10",
            inputStyle
          )}
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={placeholder}
          type={secureTextEntry && !showPassword ? "password" : keyboardType === 'numeric' || keyboardType === 'decimal-pad' || keyboardType === 'number-pad' ? "number" : keyboardType === 'email-address' ? "email" : "text"}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={inputStyle}
        />
        
        {secureTextEntry && (
          <button
            type="button"
            className="absolute right-3 p-1"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        )}
        
        {rightIcon && !secureTextEntry && (
          <button
            type="button"
            className="absolute right-3 p-1"
            onClick={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </button>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
