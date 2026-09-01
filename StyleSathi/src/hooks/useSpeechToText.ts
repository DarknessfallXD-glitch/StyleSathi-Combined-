import { useState, useCallback, useEffect } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
  ExpoSpeechRecognitionOptions,
  ExpoSpeechRecognitionResultEvent,
} from 'expo-speech-recognition';
import Toast from 'react-native-toast-message';

export interface UseSpeechToTextReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  abortListening: () => void;
  resetTranscript: () => void;
  hasPermissions: boolean;
  requestPermissions: () => Promise<boolean>;
}

export function useSpeechToText(
  onResult?: (finalTranscript: string) => void,
  options: ExpoSpeechRecognitionOptions = {}
): UseSpeechToTextReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasPermissions, setHasPermissions] = useState(false);

  const defaultOptions: ExpoSpeechRecognitionOptions = {
    lang: 'en-US',
    interimResults: true,
    continuous: false,
    ...options,
  };

  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
    setError(null);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('result', (event: ExpoSpeechRecognitionResultEvent) => {
    if (event.results && event.results.length > 0) {
      const result = event.results[0];
      if (event.isFinal) {
        setTranscript(result.transcript);
        setInterimTranscript('');
        onResult?.(result.transcript);
      } else {
        setInterimTranscript(result.transcript);
      }
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    setIsListening(false);
    const errorMessage = event.message || `Speech recognition error: ${event.error}`;
    setError(errorMessage);
    Toast.show({
      type: 'error',
      text1: 'Speech Recognition Error',
      text2: errorMessage,
    });
  });

  const checkPermissions = useCallback(async () => {
    try {
      const result = await ExpoSpeechRecognitionModule.getPermissionsAsync();
      setHasPermissions(result.granted === true);
      return result.granted === true;
    } catch {
      setHasPermissions(false);
      return false;
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      const granted = result.granted === true;
      setHasPermissions(granted);
      return granted;
    } catch {
      setHasPermissions(false);
      return false;
    }
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const startListening = useCallback(async () => {
    setError(null);
    setInterimTranscript('');

    const permitted = await requestPermissions();
    if (!permitted) {
      setError('Microphone and speech recognition permissions are required');
      Toast.show({
        type: 'error',
        text1: 'Permission Denied',
        text2: 'Please enable microphone and speech recognition permissions in settings',
      });
      return;
    }

    try {
      ExpoSpeechRecognitionModule.start(defaultOptions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start speech recognition';
      setError(errorMessage);
      setIsListening(false);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    }
  }, [defaultOptions, requestPermissions]);

  const stopListening = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const abortListening = useCallback(() => {
    ExpoSpeechRecognitionModule.abort();
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    abortListening,
    resetTranscript,
    hasPermissions,
    requestPermissions,
  };
}