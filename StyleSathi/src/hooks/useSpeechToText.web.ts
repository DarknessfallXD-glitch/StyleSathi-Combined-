import { useState, useCallback } from 'react';

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

// Web-safe no-op. `expo-speech-recognition` is native-only (it throws
// "Cannot find native module" at import time on web), so the browser build
// uses this stub to keep Home/Search screens from crashing.
export function useSpeechToText(
  _onResult?: (finalTranscript: string) => void
): UseSpeechToTextReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasPermissions, setHasPermissions] = useState(false);

  const requestPermissions = useCallback(async () => {
    const granted =
      typeof window !== 'undefined' && !!window.navigator?.permissions;
    setHasPermissions(granted);
    return granted;
  }, []);

  const startListening = useCallback(async () => {
    setError('Speech recognition is not supported in the browser.');
    setHasPermissions(false);
  }, []);

  const stopListening = useCallback(() => {},
  []);

  const abortListening = useCallback(() => {
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