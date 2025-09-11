import React, { useState } from 'react';
import {
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Button } from './ui/Button';
import { Select } from './ui/Select';

interface TextToSpeechProps {
  text: string;
  title?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TextToSpeech: React.FC<TextToSpeechProps> = ({
  text,
  title = "Read article aloud",
  className = "",
  size = 'md'
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  
  const { speak, stop, pause, resume, speaking, supported, voices, error } = useTextToSpeech();

  if (!supported) {
    return null; // Don't render if not supported
  }

  const handleSpeak = () => {
    const voice = voices.find(v => v.name === selectedVoice) || undefined;
    speak(text, {
      rate,
      pitch,
      voice,
      language: 'en-US'
    });
  };

  const handleStop = () => {
    stop();
  };

  const handlePause = () => {
    if (speaking) {
      pause();
    } else {
      resume();
    }
  };

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  const voiceOptions = voices
    .filter(voice => voice.lang.startsWith('en'))
    .map(voice => ({
      value: voice.name,
      label: `${voice.name} (${voice.lang})`
    }));

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {error && (
        <div className="text-red-600 text-xs mr-2">{error}</div>
      )}
      
      {/* Main controls */}
      <div className="flex items-center gap-1">
        {!speaking ? (
          <Button
            onClick={handleSpeak}
            variant="outline"
            size={buttonSize}
            title={title}
            className="flex items-center gap-1"
          >
            <SpeakerWaveIcon className={iconSize} />
            {size !== 'sm' && 'Listen'}
          </Button>
        ) : (
          <>
            <Button
              onClick={handlePause}
              variant="outline"
              size={buttonSize}
              title="Pause/Resume"
              className="flex items-center gap-1"
            >
              {speaking ? <PauseIcon className={iconSize} /> : <PlayIcon className={iconSize} />}
              {size !== 'sm' && (speaking ? 'Pause' : 'Resume')}
            </Button>
            
            <Button
              onClick={handleStop}
              variant="outline"
              size={buttonSize}
              title="Stop"
              className="flex items-center gap-1 text-red-600 hover:text-red-800"
            >
              <StopIcon className={iconSize} />
              {size !== 'sm' && 'Stop'}
            </Button>
          </>
        )}

        {/* Settings button */}
        <Button
          onClick={() => setShowSettings(!showSettings)}
          variant="ghost"
          size={buttonSize}
          title="Voice settings"
          className={`${showSettings ? 'text-primary-600' : 'text-gray-500'}`}
        >
          <Cog6ToothIcon className={iconSize} />
        </Button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="absolute z-10 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg min-w-64">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 text-sm">Voice Settings</h4>
            
            {/* Voice selection */}
            {voiceOptions.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Voice
                </label>
                <Select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  options={[
                    { value: '', label: 'Default' },
                    ...voiceOptions
                  ]}
                  className="text-sm"
                />
              </div>
            )}

            {/* Speed control */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Speed: {rate}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.5x</span>
                <span>2x</span>
              </div>
            </div>

            {/* Pitch control */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Pitch: {pitch}
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};