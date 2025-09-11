import React, { useState, useRef, useCallback } from 'react';

export interface TextToSpeechOptions {
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
  voice?: SpeechSynthesisVoice;
  language?: string;
}

export interface UseTextToSpeechReturn {
  speak: (text: string, options?: TextToSpeechOptions) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  speaking: boolean;
  supported: boolean;
  voices: SpeechSynthesisVoice[];
  error: string | null;
}

export const useTextToSpeech = (): UseTextToSpeechReturn => {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check if Speech Synthesis is supported
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load available voices
  const loadVoices = useCallback(() => {
    if (supported) {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    }
  }, [supported]);

  // Load voices on mount and when they change
  React.useEffect(() => {
    if (supported) {
      loadVoices();
      speechSynthesis.addEventListener('voiceschanged', loadVoices);
      
      return () => {
        speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, [supported, loadVoices]);

  const speak = useCallback((text: string, options: TextToSpeechOptions = {}) => {
    if (!supported) {
      setError('Text-to-speech is not supported in this browser');
      return;
    }

    if (!text.trim()) {
      setError('No text provided to speak');
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();

    try {
      // Clean HTML tags from text if present
      const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utteranceRef.current = utterance;

      // Set options
      utterance.rate = options.rate ?? 1;
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = options.volume ?? 1;
      utterance.lang = options.language ?? 'en-US';

      // Set voice if specified
      if (options.voice) {
        utterance.voice = options.voice;
      } else {
        // Try to find a good English voice
        const englishVoice = voices.find(voice => 
          voice.lang.startsWith('en') && voice.localService
        ) || voices.find(voice => voice.lang.startsWith('en'));
        
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }

      // Event handlers
      utterance.onstart = () => {
        setSpeaking(true);
        setError(null);
      };

      utterance.onend = () => {
        setSpeaking(false);
        utteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        setSpeaking(false);
        setError(`Speech error: ${event.error}`);
        utteranceRef.current = null;
      };

      utterance.onpause = () => {
        setSpeaking(false);
      };

      utterance.onresume = () => {
        setSpeaking(true);
      };

      // Start speaking
      speechSynthesis.speak(utterance);
      
    } catch (err) {
      setError(`Failed to initialize speech: ${err}`);
    }
  }, [supported, voices]);

  const stop = useCallback(() => {
    if (supported && speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      utteranceRef.current = null;
    }
  }, [supported]);

  const pause = useCallback(() => {
    if (supported && speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
    }
  }, [supported]);

  const resume = useCallback(() => {
    if (supported && speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  }, [supported]);

  return {
    speak,
    stop,
    pause,
    resume,
    speaking,
    supported,
    voices,
    error,
  };
};