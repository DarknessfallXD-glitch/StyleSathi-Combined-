import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { handleOAuthCallback } from '../services/oauth';

export default function OAuthCallbackScreen() {
  useEffect(() => {
    handleOAuthCallback();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#FF6B8A" />
    </View>
  );
}