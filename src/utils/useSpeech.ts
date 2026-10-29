import { useState, useRef, useEffect, useCallback } from 'react';

export interface UseSpeechOptions {
  voice?: string; // 'Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'
  useBrowserTTSFallback?: boolean;
}

export function useSpeech(options?: UseSpeechOptions) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // 1. Text to Speech
  const stopSpeaking = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsGeneratingTTS(false);
    setPlayingId(null);
  }, []);

  const speak = useCallback(
    async (text: string, id: string = 'global') => {
      // If already playing this same item, stop/toggle
      if (playingId === id && isSpeaking) {
        stopSpeaking();
        return;
      }

      stopSpeaking();
      setPlayingId(id);
      setIsGeneratingTTS(true);

      const cleanText = text
        .replace(/[*#_`>~]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .slice(0, 1500);

      try {
        // Try server-side Gemini 3.8 Flash Lite TTS
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleanText,
            voice: options?.voice || 'Kore',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.audioBase64) {
            const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
            currentAudioRef.current = audio;
            setIsGeneratingTTS(false);
            setIsSpeaking(true);

            audio.onended = () => {
              setIsSpeaking(false);
              setPlayingId(null);
              currentAudioRef.current = null;
            };

            audio.onerror = () => {
              // Fallback to browser TTS if audio playback fails
              fallbackBrowserTTS(cleanText, id);
            };

            await audio.play();
            return;
          }
        }
        // Fallback if server TTS didn't return audio
        fallbackBrowserTTS(cleanText, id);
      } catch (err) {
        console.warn('Server TTS failed, falling back to browser synthesis:', err);
        fallbackBrowserTTS(cleanText, id);
      }
    },
    [options?.voice, playingId, isSpeaking, stopSpeaking]
  );

  const fallbackBrowserTTS = (text: string, id: string) => {
    setIsGeneratingTTS(false);
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeaking(false);
      setPlayingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setPlayingId(id);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setPlayingId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setPlayingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // 2. Speech to Text (Web Speech API SpeechRecognition)
  const isSTTSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = useCallback(
    (onResult: (text: string) => void) => {
      if (!isSTTSupported) {
        alert('Speech-to-text is not supported by your current browser. Please try Chrome, Edge, or Safari.');
        return;
      }

      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let finalTrans = '';
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTrans += item[0].transcript + ' ';
          } else {
            interim += item[0].transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
        }

        if (finalTrans) {
          onResult(finalTrans);
          setInterimTranscript('');
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone access was denied. Please allow microphone permissions in your browser.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (e) {
        console.error('Failed to start speech recognition:', e);
        setIsListening(false);
      }
    },
    [isSTTSupported]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [stopSpeaking]);

  return {
    isSpeaking,
    isGeneratingTTS,
    playingId,
    speak,
    stopSpeaking,
    isListening,
    interimTranscript,
    startListening,
    stopListening,
    isSTTSupported,
  };
}
