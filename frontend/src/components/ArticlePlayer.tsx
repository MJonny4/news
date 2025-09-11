import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';
import { Button } from './ui/Button';
import { Card, CardBody, CardHeader } from './ui/Card';
import { usePageUnload } from '@/hooks/usePageUnload';

interface ArticlePlayerProps {
  article: {
    id: number;
    title: string;
    description?: string | null;
    content?: string | null;
  };
  className?: string;
}

interface PlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  currentPosition: number;
  totalCharacters: number;
  elapsedTime: number;
  estimatedTotalTime: number;
}

export const ArticlePlayer: React.FC<ArticlePlayerProps> = ({ article, className = '' }) => {
  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    isPaused: false,
    currentPosition: 0,
    totalCharacters: 0,
    elapsedTime: 0,
    estimatedTotalTime: 0
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const totalPausedDurationRef = useRef<number>(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const textRef = useRef<string>('');
  const isPlayingRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);

  // Check if Web Speech API is supported
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Build the text to speak
  const buildText = () => {
    let text = '';
    if (article.title) text += `${article.title}. `;
    if (article.description) text += `${article.description}. `;
    if (article.content) text += article.content;
    else if (!article.description) text += 'Content not available for this article.';
    
    return text.trim().replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Update progress
  const updateProgress = () => {
    if (!isPlayingRef.current || isPausedRef.current || !textRef.current) {
      return;
    }

    const now = Date.now();
    const elapsed = (now - startTimeRef.current - totalPausedDurationRef.current) / 1000;
    
    // Estimate reading speed (average 150 words per minute)
    const words = textRef.current.split(' ').filter(word => word.length > 0).length;
    const estimatedDuration = (words / 150) * 60; // Convert to seconds
    
    // Calculate progress based on elapsed time vs estimated duration
    const progress = Math.min(elapsed / estimatedDuration, 1);
    const currentPos = Math.floor(progress * textRef.current.length);

    setState(prev => ({
      ...prev,
      currentPosition: currentPos,
      elapsedTime: elapsed,
      estimatedTotalTime: estimatedDuration
    }));
  };

  // Start progress tracking
  const startProgressTracking = () => {
    startTimeRef.current = Date.now();
    totalPausedDurationRef.current = 0;
    progressIntervalRef.current = setInterval(updateProgress, 500);
  };

  // Stop progress tracking
  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // Handle pause timing
  useEffect(() => {
    if (state.isPaused && pausedTimeRef.current === 0) {
      pausedTimeRef.current = Date.now();
    } else if (!state.isPaused && pausedTimeRef.current > 0) {
      totalPausedDurationRef.current += Date.now() - pausedTimeRef.current;
      pausedTimeRef.current = 0;
    }
  }, [state.isPaused]);

  // Play function
  const play = () => {
    if (!isSupported) return;

    // Stop any current speech
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    const text = buildText();
    textRef.current = text;

    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Set speech options
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = 'en-US';

    // Try to use a good English voice
    const voices = speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => 
      voice.lang.startsWith('en') && voice.localService
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    // Event handlers
    utterance.onstart = () => {
      const words = text.split(' ').filter(word => word.length > 0).length;
      const estimatedDuration = (words / 150) * 60; // Convert to seconds
      
      // Update refs
      isPlayingRef.current = true;
      isPausedRef.current = false;
      
      setState(prev => ({
        ...prev,
        isPlaying: true,
        isPaused: false,
        totalCharacters: text.length,
        currentPosition: 0,
        elapsedTime: 0,
        estimatedTotalTime: estimatedDuration
      }));
      startProgressTracking();
    };

    utterance.onend = () => {
      isPlayingRef.current = false;
      isPausedRef.current = false;
      
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
        currentPosition: prev.totalCharacters,
        elapsedTime: prev.estimatedTotalTime
      }));
      stopProgressTracking();
    };

    utterance.onerror = () => {
      isPlayingRef.current = false;
      isPausedRef.current = false;
      
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false
      }));
      stopProgressTracking();
    };

    utterance.onpause = () => {
      isPausedRef.current = true;
      setState(prev => ({ ...prev, isPaused: true }));
      // Stop interval while paused to avoid unnecessary calls
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };

    utterance.onresume = () => {
      isPausedRef.current = false;
      setState(prev => ({ ...prev, isPaused: false }));
      // Restart interval when resumed
      if (!progressIntervalRef.current) {
        progressIntervalRef.current = setInterval(updateProgress, 500);
      }
    };

    // Start speaking
    speechSynthesis.speak(utterance);
  };

  // Pause function
  const pause = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
    }
  };

  // Resume function
  const resume = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  };

  // Stop function
  const stop = useCallback(() => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    // Update refs
    isPlayingRef.current = false;
    isPausedRef.current = false;
    
    setState({
      isPlaying: false,
      isPaused: false,
      currentPosition: 0,
      totalCharacters: 0,
      elapsedTime: 0,
      estimatedTotalTime: 0
    });
    
    stopProgressTracking();
    utteranceRef.current = null;
  }, []);

  // Auto-stop when component unmounts or article changes
  useEffect(() => {
    return () => {
      stop();
    };
  }, [article.id, stop]);

  // Auto-stop when navigating away from page
  usePageUnload(stop);

  // Don't render if not supported
  if (!isSupported) {
    return null;
  }

  const progressPercentage = state.totalCharacters > 0 
    ? (state.currentPosition / state.totalCharacters) * 100 
    : 0;

  const remainingTime = state.estimatedTotalTime - state.elapsedTime;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SpeakerWaveIcon className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-gray-900">Audio Player</span>
          </div>
          
          {state.isPlaying && (
            <div className="text-sm text-gray-600">
              {state.isPaused ? 'Paused' : 'Playing'}
            </div>
          )}
        </div>
      </CardHeader>

      <CardBody>
        {/* Progress Bar */}
        {state.totalCharacters > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{formatTime(state.elapsedTime)}</span>
              <span>{state.currentPosition.toLocaleString()} / {state.totalCharacters.toLocaleString()} chars</span>
              <span>{formatTime(Math.max(0, remainingTime))} remaining</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!state.isPlaying ? (
            <Button
              onClick={play}
              variant="primary"
              size="lg"
              className="flex items-center gap-2"
            >
              <PlayIcon className="w-5 h-5" />
              Listen to Article
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              {state.isPaused ? (
                <Button
                  onClick={resume}
                  variant="primary"
                  size="md"
                  className="flex items-center gap-1"
                >
                  <PlayIcon className="w-4 h-4" />
                  Resume
                </Button>
              ) : (
                <Button
                  onClick={pause}
                  variant="outline"
                  size="md"
                  className="flex items-center gap-1"
                >
                  <PauseIcon className="w-4 h-4" />
                  Pause
                </Button>
              )}
              
              <Button
                onClick={stop}
                variant="outline"
                size="md"
                className="flex items-center gap-1 text-red-600 hover:text-red-800"
              >
                <StopIcon className="w-4 h-4" />
                Stop
              </Button>
            </div>
          )}
        </div>

        {/* Article Info */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 truncate">
            {article.title}
          </p>
          {textRef.current && (
            <p className="text-xs text-gray-400 mt-1">
              {textRef.current.split(' ').length} words • Estimated {formatTime((textRef.current.split(' ').length / 150) * 60)}
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
};