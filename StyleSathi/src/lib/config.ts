const DEV_API_URL = 'http://localhost:8000';

const PROD_API_URL = 'https://api.stylesathi.com';

const getApiUrl = (): string => {
  return __DEV__ ? DEV_API_URL : PROD_API_URL;
};

export const API_BASE_URL = getApiUrl();

export const OAUTH_REDIRECT_URI = 'https://auth.expo.io/@darknessfallxd/stylesathy';
