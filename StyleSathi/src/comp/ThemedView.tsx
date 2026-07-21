import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../Context/ThemeContext';

interface ThemedViewProps extends ViewProps {
  style?: any;
}

export const ThemedView: React.FC<ThemedViewProps> = ({ style, children, ...props }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[{ backgroundColor: colors.background }, style]} {...props}>
      {children}
    </View>
  );
};