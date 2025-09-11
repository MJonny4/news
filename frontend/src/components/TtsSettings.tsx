import React, { useState, useEffect } from 'react';
import {
  SpeakerWaveIcon,
  Cog6ToothIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Card, CardBody, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface TtsSettingsProps {
  className?: string;
}

interface TtsPreferences {
  defaultRate: number;
  defaultPitch: number;
  defaultVolume: number;
  preferredVoice: string;
  readTitles: boolean;
  readDescriptions: boolean;
  autoPlayNext: boolean;
  skipAds: boolean;
  language: string;
}

export const TtsSettings: React.FC<TtsSettingsProps> = ({ className = "" }) => {
  const { voices, supported, speak, stop } = useTextToSpeech();
  const [preferences, setPreferences] = useState<TtsPreferences>({
    defaultRate: 1.0,
    defaultPitch: 1.0,
    defaultVolume: 1.0,
    preferredVoice: '',
    readTitles: true,
    readDescriptions: true,
    autoPlayNext: false,
    skipAds: true,
    language: 'en-US'
  });
  const [isPlaying, setIsPlaying] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('tts-preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load TTS preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = (newPreferences: TtsPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('tts-preferences', JSON.stringify(newPreferences));
  };

  const handlePreferenceChange = <K extends keyof TtsPreferences>(
    key: K,
    value: TtsPreferences[K]
  ) => {
    savePreferences({ ...preferences, [key]: value });
  };

  const testVoice = () => {
    if (isPlaying) {
      stop();
      setIsPlaying(false);
      return;
    }

    const testText = "This is a test of the text to speech settings. The quick brown fox jumps over the lazy dog.";
    const voice = voices.find(v => v.name === preferences.preferredVoice);
    
    setIsPlaying(true);
    speak(testText, {
      rate: preferences.defaultRate,
      pitch: preferences.defaultPitch,
      volume: preferences.defaultVolume,
      voice: voice,
      language: preferences.language
    });

    // Reset playing state after a delay (approximate test duration)
    setTimeout(() => {
      setIsPlaying(false);
    }, (testText.length / (preferences.defaultRate * 15)) * 1000);
  };

  const resetToDefaults = () => {
    const defaults: TtsPreferences = {
      defaultRate: 1.0,
      defaultPitch: 1.0,
      defaultVolume: 1.0,
      preferredVoice: '',
      readTitles: true,
      readDescriptions: true,
      autoPlayNext: false,
      skipAds: true,
      language: 'en-US'
    };
    savePreferences(defaults);
  };

  if (!supported) {
    return (
      <Card className={className}>
        <CardBody>
          <div className="text-center py-8">
            <XMarkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Text-to-Speech Not Supported
            </h3>
            <p className="text-gray-500">
              Your browser doesn't support text-to-speech functionality.
              Please try using a modern browser like Chrome, Firefox, or Safari.
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const englishVoices = voices.filter(voice => 
    voice.lang.startsWith('en') || voice.lang.startsWith('En')
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <SpeakerWaveIcon className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Text-to-Speech Settings</h2>
        </div>
      </CardHeader>
      
      <CardBody className="space-y-6">
        {/* Voice Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Voice
          </label>
          <div className="flex items-center gap-3">
            <select
              value={preferences.preferredVoice}
              onChange={(e) => handlePreferenceChange('preferredVoice', e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">System Default</option>
              {englishVoices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                  {voice.localService && ' - Local'}
                </option>
              ))}
            </select>
            
            <Button
              onClick={testVoice}
              variant={isPlaying ? "danger" : "outline"}
              size="sm"
              className="flex items-center gap-2"
            >
              {isPlaying ? <XMarkIcon className="w-4 h-4" /> : <SpeakerWaveIcon className="w-4 h-4" />}
              {isPlaying ? 'Stop' : 'Test'}
            </Button>
          </div>
          
          {englishVoices.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">
              No English voices available. The system default will be used.
            </p>
          )}
        </div>

        {/* Speed Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Speaking Speed: {preferences.defaultRate}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={preferences.defaultRate}
            onChange={(e) => handlePreferenceChange('defaultRate', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Slower (0.5x)</span>
            <span>Normal (1x)</span>
            <span>Faster (2.5x)</span>
          </div>
        </div>

        {/* Pitch Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Voice Pitch: {preferences.defaultPitch}
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={preferences.defaultPitch}
            onChange={(e) => handlePreferenceChange('defaultPitch', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Lower</span>
            <span>Normal</span>
            <span>Higher</span>
          </div>
        </div>

        {/* Volume Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Volume: {Math.round(preferences.defaultVolume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={preferences.defaultVolume}
            onChange={(e) => handlePreferenceChange('defaultVolume', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Muted</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Reading Preferences */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Reading Preferences</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.readTitles}
                onChange={(e) => handlePreferenceChange('readTitles', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Include article titles when reading
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.readDescriptions}
                onChange={(e) => handlePreferenceChange('readDescriptions', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Include article descriptions when reading
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.autoPlayNext}
                onChange={(e) => handlePreferenceChange('autoPlayNext', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Automatically play next article in queue
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.skipAds}
                onChange={(e) => handlePreferenceChange('skipAds', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Skip advertisement content when possible
              </span>
            </label>
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={preferences.language}
            onChange={(e) => handlePreferenceChange('language', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="en-AU">English (Australia)</option>
            <option value="en-CA">English (Canada)</option>
          </select>
        </div>

        {/* Status and Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">System Information</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Available Voices:</span>
              <Badge variant="secondary">{voices.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>English Voices:</span>
              <Badge variant="secondary">{englishVoices.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Browser Support:</span>
              <Badge variant="success">
                <CheckIcon className="w-3 h-3 mr-1" />
                Supported
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Button
            onClick={resetToDefaults}
            variant="outline"
            size="sm"
          >
            Reset to Defaults
          </Button>
          
          <div className="text-sm text-gray-500">
            Settings are saved automatically
          </div>
        </div>
      </CardBody>
    </Card>
  );
};