import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Maximize2,
  Settings,
  Clock,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Speaker {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  color: string;
}

interface PodcastPlayerProps {
  speakers: Speaker[];
  currentSpeaker?: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onSpeedChange: (speed: number) => void;
  onVolumeChange: (volume: number) => void;
  onModeChange: (mode: 'audio' | 'video') => void;
  currentMode: 'audio' | 'video';
  progress: number;
  duration: number;
  volume: number;
  speed: number;
}

const PodcastPlayer: React.FC<PodcastPlayerProps> = ({
  speakers,
  currentSpeaker,
  isPlaying,
  onPlayPause,
  onSkipBack,
  onSkipForward,
  onSpeedChange,
  onVolumeChange,
  onModeChange,
  currentMode,
  progress,
  duration,
  volume,
  speed
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
    onVolumeChange(isMuted ? volume : 0);
  };

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const currentSpeakerData = speakers.find(s => s.id === currentSpeaker);

  return (
    <div className="bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm shadow-lg rounded-2xl border border-muted/40">
      {/* Main Player Controls */}
      <div className="p-2 space-y-2">
        {/* Mode Toggle */}
        <div className="flex justify-center">
          <div className="flex bg-gray-200 dark:bg-gray-700 rounded-sm p-0.5">
            <button
              onClick={() => onModeChange('audio')}
              className={cn(
                "px-2 py-0.5 rounded text-xs font-medium transition-colors",
                currentMode === 'audio'
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              Audio
            </button>
            <button
              onClick={() => onModeChange('video')}
              className={cn(
                "px-2 py-0.5 rounded text-xs font-medium transition-colors",
                currentMode === 'video'
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              Video
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <Slider
            value={[progress]}
            max={duration}
            step={1}
            className="w-full"
            onValueChange={(value) => {
              // Handle seek functionality
            }}
          />
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkipBack}
            className="h-6 w-6 p-0"
          >
            <SkipBack className="h-3.5 w-3.5" />
          </Button>
          
          <Button
            onClick={onPlayPause}
            className="h-8 w-8 rounded-full p-0"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkipForward}
            className="h-6 w-6 p-0"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-center gap-2">
          {/* Volume Control */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVolumeToggle}
              className="h-6 w-6 p-0 flex items-center justify-center"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-3 w-3" />
              ) : (
                <Volume2 className="h-3 w-3" />
              )}
            </Button>
            {showVolumeSlider && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3">
                <div className="w-2 h-20 bg-gray-200 dark:bg-gray-600 rounded-full relative">
                  <div 
                    className="absolute bottom-0 w-2 bg-primary rounded-full transition-all duration-200"
                    style={{ height: `${isMuted ? 0 : volume}%` }}
                  />
                  <div 
                    className="absolute w-4 h-4 bg-primary rounded-full -left-1 transition-all duration-200 cursor-pointer"
                    style={{ bottom: `${isMuted ? 0 : volume}%`, transform: 'translateY(50%)' }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                      if (rect) {
                        const y = e.clientY - rect.bottom;
                        const height = rect.height;
                        const percentage = Math.max(0, Math.min(100, ((height + y) / height) * 100));
                        onVolumeChange(percentage);
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Speed Control */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="h-6 w-6 p-0 flex items-center justify-center text-xs"
            >
              {speed}x
            </Button>
            {showSpeedMenu && (
              <div className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg min-w-[60px]">
                {speedOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      onSpeedChange(option);
                      setShowSpeedMenu(false);
                    }}
                    className={cn(
                      "block w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700",
                      speed === option && "bg-gray-100 dark:bg-gray-700 font-medium"
                    )}
                  >
                    {option}x
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video/Audio Display Area */}
      {currentMode === 'video' && (
        <div className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-2">
          <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Speaker Avatars */}
            <div className="flex items-center gap-4">
              {speakers.map((speaker) => (
                <div
                  key={speaker.id}
                  className={cn(
                    "flex flex-col items-center gap-1 transition-all duration-300",
                    currentSpeaker === speaker.id
                      ? "scale-110 opacity-100"
                      : "scale-90 opacity-60"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                      <AvatarImage src={speaker.avatar} />
                      <AvatarFallback 
                        className="text-xs font-semibold"
                        style={{ backgroundColor: speaker.color }}
                      >
                        {speaker.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {currentSpeaker === speaker.id && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-white flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {speaker.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Animated Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 left-2 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
              <div className="absolute top-4 right-4 w-0.5 h-0.5 bg-purple-400 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-0.5 h-0.5 bg-pink-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default PodcastPlayer; 