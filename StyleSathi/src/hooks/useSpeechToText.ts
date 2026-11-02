import { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
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
    console.log('[Speech] Recognition started');
    setIsListening(true);
    setError(null);
  });

  useSpeechRecognitionEvent('end', () => {
    console.log('[Speech] Recognition ended');
    setIsListening(false);
  });

  useSpeechRecognitionEvent(
    'result',
    (event: ExpoSpeechRecognitionResultEvent) => {
      console.log('[Speech] Result event:', event);

      if (event.results && event.results.length > 0) {
        const results = Array.from(event.results);
        const result = results[results.length - 1];

        if (!result?.transcript) {
          return;
        }

        if (event.isFinal) {
          const finalText = results
            .filter((item) => item?.transcript)
            .map((item) => item.transcript)
            .join(' ')
            .trim();

          if (finalText) {
            setTranscript((previous) =>
              previous ? `${previous} ${finalText}` : finalText
            );
            setInterimTranscript('');
            onResult?.(finalText);
          }
        } else {
          setInterimTranscript(result.transcript);
        }
      }
    }
  );

  useSpeechRecognitionEvent('error', (event) => {
    console.error('[Speech] Recognition error:', event);

    setIsListening(false);

    const errorMessage =
      event.message ||
      `Speech recognition error: ${event.error}`;

    setError(errorMessage);

    Toast.show({
      type: 'error',
      text1: 'Speech Recognition Error',
      text2: errorMessage,
    });
  });

  const checkPermissions = useCallback(async () => {
    if (Platform.OS === 'web') {
      try {
        const available =
          ExpoSpeechRecognitionModule.isRecognitionAvailable();

        console.log('[Speech] Recognition available:', available);
        setHasPermissions(available);
        return available;
      } catch (err) {
        console.error('[Speech] Availability check failed:', err);
        setHasPermissions(false);
        return false;
      }
    }

    try {
      const result =
        await ExpoSpeechRecognitionModule.getPermissionsAsync();

      setHasPermissions(result.granted === true);
      return result.granted === true;
    } catch (err) {
      console.error('[Speech] Permission check failed:', err);
      setHasPermissions(false);
      return false;
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    if (Platform.OS === 'web') {
      try {
        const available =
          ExpoSpeechRecognitionModule.isRecognitionAvailable();

        console.log('[Speech] Web recognition available:', available);
        setHasPermissions(available);
        return available;
      } catch (err) {
        console.error('[Speech] Web availability check failed:', err);
        setHasPermissions(false);
        return false;
      }
    }

    try {
      const result =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      const granted = result.granted === true;
      setHasPermissions(granted);
      return granted;
    } catch (err) {
      console.error('[Speech] Permission request failed:', err);
      setHasPermissions(false);
      return false;
    }
  }, []);

  useEffect(() => {
    void checkPermissions();
  }, [checkPermissions]);

  const startListening = useCallback(async () => {
    setError(null);
    setInterimTranscript('');

    try {
      const available =
        ExpoSpeechRecognitionModule.isRecognitionAvailable();

      console.log('[Speech] Platform:', Platform.OS);
      console.log('[Speech] Recognition available:', available);

      if (!available) {
        const message =
          'Speech recognition is unavailable in this browser. Try a supported browser such as Chrome.';

        setError(message);

        Toast.show({
          type: 'error',
          text1: 'Speech Recognition Unavailable',
          text2: message,
        });

        return;
      }

      if (Platform.OS !== 'web') {
        const permitted = await requestPermissions();

        if (!permitted) {
          const message =
            'Microphone and speech recognition permissions are required.';

          setError(message);

          Toast.show({
            type: 'error',
            text1: 'Permission Denied',
            text2: message,
          });

          return;
        }
      }

      console.log('[Speech] Starting with options:', defaultOptions);

      ExpoSpeechRecognitionModule.start(defaultOptions);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to start speech recognition';

      console.error('[Speech] Start failed:', err);

      setError(errorMessage);
      setIsListening(false);

      Toast.show({
        type: 'error',
        text1: 'Speech Recognition Error',
        text2: errorMessage,
      });
    }
  }, [defaultOptions, requestPermissions]);

  const stopListening = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch (err) {
      console.error('[Speech] Stop failed:', err);
      setIsListening(false);
    }
  }, []);

  const abortListening = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch (err) {
      console.error('[Speech] Abort failed:', err);
    }

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
