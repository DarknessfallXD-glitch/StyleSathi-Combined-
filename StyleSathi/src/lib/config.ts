import Constants from 'expo-constants';

const PROD_API_URL = 'https://api.stylesathi.com';

const getDevApiUrl = (): string => {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  // Reuse the Metro/Expo dev-server host (the computer's LAN IP) so physical
  // devices and emulators can reach the FastAPI backend without hardcoding it.
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).expoGoConfig?.debuggerHost ??
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

  const host =
    typeof hostUri === 'string' ? hostUri.split(':')[0] : undefined;

  return host ? `http://${host}:8000` : 'http://localhost:8000';
};

export const API_BASE_URL = (
  __DEV__ ? getDevApiUrl() : PROD_API_URL
).replace(/\/$/, '');

export const OAUTH_REDIRECT_URI =
  'https://auth.expo.io/@darknessfallxd/stylesathy';
