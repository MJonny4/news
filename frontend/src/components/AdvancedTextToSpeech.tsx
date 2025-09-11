import React, { useState } from 'react';
import {
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ForwardIcon,
  BackwardIcon,
  Cog6ToothIcon,
  QueueListIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useAdvancedTextToSpeech, Article, TtsQueueItem } from '@/hooks/useAdvancedTextToSpeech';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Badge } from './ui/Badge';

interface AdvancedTextToSpeechProps {
  article?: Article;
  text?: string;
  title?: string;
  className?: string;
  showQueue?: boolean;
  showProgress?: boolean;
  compact?: boolean;
}

export const AdvancedTextToSpeech: React.FC<AdvancedTextToSpeechProps> = ({
  article,
  text,
  title = "Advanced text to speech player",
  className = "",
  showQueue = true,
  showProgress = true,
  compact = false
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showQueuePanel, setShowQueuePanel] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!compact);
  
  const tts = useAdvancedTextToSpeech();

  if (!tts.supported) {
    return null;
  }

  const handleSpeak = () => {
    if (article) {
      tts.speakArticle(article);
    } else if (text) {
      tts.speak(text);
    }
  };

  const addArticleToQueue = () => {
    if (article) {
      const queueItem: TtsQueueItem = {
        id: `article-${article.id}-${Date.now()}`,
        title: article.title,
        text: `${article.title}. ${article.description || ''}. ${article.content || 'Content not available.'}`,
        article,
      };
      tts.addToQueue(queueItem);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (compact && !isExpanded) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        {!tts.speaking ? (
          <Button
            onClick={handleSpeak}
            variant="outline"
            size="sm"
            title={title}
            className="flex items-center gap-1"
          >
            <SpeakerWaveIcon className="w-4 h-4" />
            Listen
          </Button>
        ) : (
          <div className="flex items-center gap-1">
            <Button
              onClick={tts.pause}
              variant="outline"
              size="sm"
              title="Pause"
            >
              <PauseIcon className="w-4 h-4" />
            </Button>
            <Button
              onClick={tts.stop}
              variant="outline"
              size="sm"
              title="Stop"
              className="text-red-600 hover:text-red-800"
            >
              <StopIcon className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        <Button
          onClick={() => setIsExpanded(true)}
          variant="ghost"
          size="sm"
          title="Expand player"
        >
          <ChevronUpIcon className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <SpeakerWaveIcon className="w-5 h-5 text-primary-600" />
          <span className="font-medium text-gray-900">Audio Player</span>
          {tts.currentItem && (
            <Badge variant="primary" size="sm">Playing</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {showQueue && tts.queue.length > 0 && (
            <Button
              onClick={() => setShowQueuePanel(!showQueuePanel)}
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
            >
              <QueueListIcon className="w-4 h-4" />
              <span className="text-xs">{tts.queue.length}</span>
            </Button>
          )}
          
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="ghost"
            size="sm"
            title="Settings"
            className={showSettings ? 'text-primary-600' : ''}
          >
            <Cog6ToothIcon className="w-4 h-4" />
          </Button>
          
          {compact && (
            <Button
              onClick={() => setIsExpanded(false)}
              variant="ghost"
              size="sm"
              title="Minimize player"
            >
              <ChevronDownIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Currently Playing */}
      {tts.currentItem && (
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {tts.currentItem.title}
              </p>
              {tts.currentItem.article && (
                <p className="text-xs text-gray-500 mt-1">
                  Article #{tts.currentItem.article.id}
                </p>
              )}
            </div>
            
            {showProgress && tts.progress && (
              <div className="ml-4 text-right">
                <div className="text-xs text-gray-500">
                  {formatTime(tts.progress.estimatedTimeRemaining)} remaining
                </div>
                <div className="text-xs text-gray-400">
                  {Math.round(tts.progress.percentage)}%
                </div>
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          {showProgress && tts.progress && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${tts.progress.percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{tts.progress.currentPosition} / {tts.progress.totalLength} chars</span>
                <span>{formatTime((tts.progress.totalLength - tts.progress.currentPosition) / 200)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Controls */}
      <div className="p-4">
        <div className="flex items-center justify-center gap-3">
          {/* Previous */}
          <Button
            onClick={tts.playPrevious}
            variant="outline"
            size="sm"
            disabled={!tts.currentItem}
            title="Previous/Restart"
          >
            <BackwardIcon className="w-4 h-4" />
          </Button>

          {/* Skip Back */}
          <Button
            onClick={() => tts.skipBackward(10)}
            variant="outline"
            size="sm"
            disabled={!tts.speaking}
            title="Skip back 10s"
          >
            <BackwardIcon className="w-3 h-3" />
            10s
          </Button>

          {/* Play/Pause/Stop */}
          <div className="flex items-center gap-1">
            {!tts.speaking ? (
              <Button
                onClick={handleSpeak}
                variant="primary"
                size="md"
                title="Play"
                disabled={tts.loading}
                loading={tts.loading}
              >
                <PlayIcon className="w-5 h-5" />
              </Button>
            ) : (
              <>
                <Button
                  onClick={tts.pause}
                  variant="outline"
                  size="md"
                  title="Pause"
                >
                  <PauseIcon className="w-5 h-5" />
                </Button>
                
                <Button
                  onClick={tts.stop}
                  variant="outline"
                  size="md"
                  title="Stop"
                  className="text-red-600 hover:text-red-800"
                >
                  <StopIcon className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>

          {/* Skip Forward */}
          <Button
            onClick={() => tts.skipForward(10)}
            variant="outline"
            size="sm"
            disabled={!tts.speaking}
            title="Skip forward 10s"
          >
            <ForwardIcon className="w-3 h-3" />
            10s
          </Button>

          {/* Next */}
          <Button
            onClick={tts.playNext}
            variant="outline"
            size="sm"
            disabled={tts.queue.length === 0}
            title="Next"
          >
            <ForwardIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {article && (
              <Button
                onClick={addArticleToQueue}
                variant="outline"
                size="sm"
                title="Add to queue"
              >
                <QueueListIcon className="w-4 h-4 mr-1" />
                Queue
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Speed:</span>
            <select
              value={tts.defaultRate}
              onChange={(e) => tts.setPlaybackRate(parseFloat(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Audio Settings</h4>
          
          <div className="space-y-3">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={tts.readTitles}
                  onChange={(e) => tts.setReadTitles(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Read article titles</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={tts.readDescriptions}
                  onChange={(e) => tts.setReadDescriptions(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Read article descriptions</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={tts.autoPlayNext}
                  onChange={(e) => tts.setAutoPlayNext(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Auto-play next in queue</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Queue Panel */}
      {showQueuePanel && tts.queue.length > 0 && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Queue ({tts.queue.length})</h4>
            <Button
              onClick={tts.clearQueue}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-800"
            >
              Clear All
            </Button>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {tts.queue.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded text-sm"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-gray-400 text-xs">{index + 1}.</span>
                  <span className="font-medium truncate">{item.title}</span>
                </div>
                <Button
                  onClick={() => tts.removeFromQueue(item.id)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {tts.error && (
        <div className="p-4 border-t border-gray-100 bg-red-50">
          <p className="text-sm text-red-600">{tts.error}</p>
        </div>
      )}
    </div>
  );
};