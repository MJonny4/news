import React from 'react';
import { TtsSettings } from '@/components/TtsSettings';

export const TtsSettingsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Text-to-Speech Settings
        </h1>
        <p className="text-gray-600">
          Configure your audio preferences for article reading.
        </p>
      </div>
      
      <TtsSettings />
    </div>
  );
};