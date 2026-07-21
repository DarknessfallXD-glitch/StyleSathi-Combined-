import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '../Context/ThemeContext';

interface ThemedTextProps extends TextProps {
  style?: any;
  type?: 'primary' | 'secondary';
}

export const ThemedText: React.FC<ThemedTextProps> = ({ style, type = 'primary', children, ...props }) => {
  const { colors } = useTheme();
  
  const color = type === 'secondary' ? colors.textSecondary : colors.text;
  
  return (
    <Text style={[{ color }, style]} {...props}>
      {children}
    </Text>
  );
};