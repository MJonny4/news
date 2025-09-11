import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTextToSpeech, TextToSpeechOptions } from './useTextToSpeech';
import { Article } from '@/types';

export interface ReadingProgress {
  currentPosition: number;
  totalLength: number;
  percentage: number;
  estimatedTimeRemaining: number; // in seconds
  currentWord?: string;
}

export interface TtsQueueItem {
  id: string;
  title: string;
  text: string;
  article?: Article;
}

export interface UseAdvancedTextToSpeechReturn {
  // Basic TTS functions
  speak: (text: string, options?: TextToSpeechOptions) => void;
  speakArticle: (article: Article, options?: TextToSpeechOptions) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  
  // Advanced features
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  setPlaybackRate: (rate: number) => void;
  
  // Queue management
  addToQueue: (item: TtsQueueItem) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
  
  // State
  speaking: boolean;
  loading: boolean;
  currentItem: TtsQueueItem | null;
  queue: TtsQueueItem[];
  progress: ReadingProgress | null;
  supported: boolean;
  error: string | null;
  
  // Settings
  autoPlayNext: boolean;
  setAutoPlayNext: (enabled: boolean) => void;
  defaultRate: number;
  setDefaultRate: (rate: number) => void;
  
  // Reading preferences
  readTitles: boolean;
  setReadTitles: (enabled: boolean) => void;
  readDescriptions: boolean;
  setReadDescriptions: (enabled: boolean) => void;
}

export const useAdvancedTextToSpeech = (): UseAdvancedTextToSpeechReturn => {
  const basicTts = useTextToSpeech();
  
  // State
  const [loading, setLoading] = useState(false);
  const [currentItem, setCurrentItem] = useState<TtsQueueItem | null>(null);
  const [queue, setQueue] = useState<TtsQueueItem[]>([]);
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [currentText, setCurrentText] = useState('');
  
  // Settings
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [defaultRate, setDefaultRate] = useState(1.0);
  const [readTitles, setReadTitles] = useState(true);
  const [readDescriptions, setReadDescriptions] = useState(true);
  
  // Refs
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const textLengthRef = useRef<number>(0);

  // Calculate reading progress
  const updateProgress = useCallback(() => {
    if (!basicTts.speaking || !currentText) {
      setProgress(null);
      return;
    }

    const now = Date.now();
    const elapsed = (now - startTimeRef.current) / 1000; // seconds
    const textLength = textLengthRef.current;
    const estimatedDuration = textLength / (defaultRate * 200); // ~200 characters per second at 1x speed
    const percentage = Math.min((elapsed / estimatedDuration) * 100, 100);
    
    // Estimate time remaining
    const estimatedTimeRemaining = Math.max(estimatedDuration - elapsed, 0);
    
    setProgress({
      currentPosition: Math.floor((percentage / 100) * textLength),
      totalLength: textLength,
      percentage,
      estimatedTimeRemaining,
    });
  }, [basicTts.speaking, currentText, defaultRate]);

  // Start progress tracking
  useEffect(() => {
    if (basicTts.speaking) {
      startTimeRef.current = Date.now();
      textLengthRef.current = currentText.length;
      
      progressIntervalRef.current = setInterval(updateProgress, 1000);
      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setProgress(null);
    }
  }, [basicTts.speaking, updateProgress, currentText]);

  // Build article text with preferences
  const buildArticleText = useCallback((article: Article): string => {
    let text = '';
    
    if (readTitles && article.title) {
      text += `${article.title}. `;
    }
    
    if (readDescriptions && article.description) {
      text += `${article.description}. `;
    }
    
    if (article.content) {
      text += article.content;
    } else if (!article.description) {
      text += 'Content not available for this article.';
    }
    
    return text.trim();
  }, [readTitles, readDescriptions]);

  // Enhanced speak function
  const speak = useCallback((text: string, options?: TextToSpeechOptions) => {
    setCurrentText(text);
    setLoading(true);
    
    const mergedOptions = {
      rate: defaultRate,
      ...options,
    };
    
    basicTts.speak(text, mergedOptions);
    setLoading(false);
  }, [basicTts, defaultRate]);

  // Speak article with formatting
  const speakArticle = useCallback((article: Article, options?: TextToSpeechOptions) => {
    const text = buildArticleText(article);
    const queueItem: TtsQueueItem = {
      id: `article-${article.id}`,
      title: article.title,
      text,
      article,
    };
    
    setCurrentItem(queueItem);
    speak(text, options);
  }, [speak, buildArticleText]);

  // Queue management
  const addToQueue = useCallback((item: TtsQueueItem) => {
    setQueue(prev => [...prev, item]);
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const playNext = useCallback(() => {
    if (queue.length > 0) {
      const nextItem = queue[0];
      setQueue(prev => prev.slice(1));
      setCurrentItem(nextItem);
      speak(nextItem.text);
    } else {
      setCurrentItem(null);
    }
  }, [queue, speak]);

  const playPrevious = useCallback(() => {
    // This could be enhanced to keep a history
    // For now, just restart current item
    if (currentItem) {
      speak(currentItem.text);
    }
  }, [currentItem, speak]);

  // Playback controls
  const skipForward = useCallback((seconds: number = 10) => {
    // This is a simplified implementation
    // Real implementation would need to track word positions
    basicTts.stop();
    if (currentItem) {
      setTimeout(() => speak(currentItem.text), 100);
    }
  }, [basicTts, currentItem, speak]);

  const skipBackward = useCallback((seconds: number = 10) => {
    // This is a simplified implementation
    basicTts.stop();
    if (currentItem) {
      setTimeout(() => speak(currentItem.text), 100);
    }
  }, [basicTts, currentItem, speak]);

  const setPlaybackRate = useCallback((rate: number) => {
    setDefaultRate(rate);
    // If currently playing, restart with new rate
    if (basicTts.speaking && currentItem) {
      basicTts.stop();
      setTimeout(() => speak(currentItem.text, { rate }), 100);
    }
  }, [basicTts, currentItem, speak]);

  // Enhanced stop with queue management
  const stop = useCallback(() => {
    basicTts.stop();
    setCurrentItem(null);
    setProgress(null);
  }, [basicTts]);

  // Auto-play next when current ends
  useEffect(() => {
    if (!basicTts.speaking && currentItem && autoPlayNext) {
      const timer = setTimeout(() => {
        playNext();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [basicTts.speaking, currentItem, autoPlayNext, playNext]);

  return {
    // Basic TTS functions
    speak,
    speakArticle,
    stop,
    pause: basicTts.pause,
    resume: basicTts.resume,
    
    // Advanced features
    skipForward,
    skipBackward,
    setPlaybackRate,
    
    // Queue management
    addToQueue,
    removeFromQueue,
    clearQueue,
    playNext,
    playPrevious,
    
    // State
    speaking: basicTts.speaking,
    loading,
    currentItem,
    queue,
    progress,
    supported: basicTts.supported,
    error: basicTts.error,
    
    // Settings
    autoPlayNext,
    setAutoPlayNext,
    defaultRate,
    setDefaultRate,
    
    // Reading preferences
    readTitles,
    setReadTitles,
    readDescriptions,
    setReadDescriptions,
  };
};