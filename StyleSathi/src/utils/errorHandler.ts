import { Alert } from 'react-native';

export type ErrorType = 
  | 'network'
  | 'storage'
  | 'camera'
  | 'auth'
  | 'payment'
  | 'validation'
  | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: any;
}

// User-friendly error messages
const errorMessages: Record<ErrorType, string> = {
  network: 'No internet connection. Please check your network and try again.',
  storage: 'Failed to save data. Please restart the app.',
  camera: 'Unable to access camera. Please check permissions.',
  auth: 'Authentication failed. Please check your credentials and try again.',
  payment: 'Payment failed. Please try again or use a different method.',
  validation: 'Please check your input and try again.',
  unknown: 'Something went wrong. Please try again later.',
};

// Show error alert to user
export const showErrorAlert = (error: AppError, onRetry?: () => void) => {
  Alert.alert(
    'Oops! Something went wrong',
    error.message || errorMessages[error.type],
    [
      { text: 'OK', style: 'cancel' },
      ...(onRetry ? [{ text: 'Retry', onPress: onRetry }] : []),
    ]
  );
};

// Log error to console (will connect to analytics later)
export const logError = (error: AppError, context?: string) => {
  console.error(`[ERROR][${context || 'App'}]:`, {
    type: error.type,
    message: error.message,
    originalError: error.originalError?.message || error.originalError,
    timestamp: new Date().toISOString(),
  });
};

// Handle API response errors
export const handleApiError = (error: any, context?: string): AppError => {
  let type: ErrorType = 'unknown';
  let message = '';
  
  if (!error) {
    type = 'network';
    message = errorMessages.network;
  } else if (error.message?.includes('network') || error.message?.includes('internet')) {
    type = 'network';
    message = errorMessages.network;
  } else if (error.message?.includes('permission')) {
    type = 'camera';
    message = errorMessages.camera;
  } else if (error.response?.status === 401 || error.response?.status === 403) {
    type = 'auth';
    message = errorMessages.auth;
  } else if (error.response?.status === 400) {
    type = 'validation';
    message = errorMessages.validation;
  } else {
    message = error.message || errorMessages.unknown;
  }
  
  const appError: AppError = { type, message, originalError: error };
  logError(appError, context);
  return appError;
};