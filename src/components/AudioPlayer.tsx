
import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AudioPlayerProps {
  audioUrl?: string;
  title?: string;
  isLoading?: boolean;
  onEnded?: () => void;
}

const AudioPlayer = ({ audioUrl, title = "Story Audio", isLoading = false, onEnded }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onEnded]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const newVolume = parseFloat(e.target.value);
    
    if (audio) {
      audio.volume = newVolume;
    }
    setVolume(newVolume);
  };

  const skipTime = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Card className="glass-card p-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin w-6 h-6 border-2 border-mystical-accent border-t-transparent rounded-full"></div>
          <span className="text-white/70">Generating audio...</span>
        </div>
      </Card>
    );
  }

  if (!audioUrl) {
    return (
      <Card className="glass-card p-4">
        <div className="text-center text-white/70">
          <Volume2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No audio available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-4 space-y-4">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div className="text-center">
        <h3 className="font-mystical text-mystical-accent">{title}</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-white/70 text-sm min-w-[40px]">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / (duration || 1)) * 100}%, #ffffff33 ${(currentTime / (duration || 1)) * 100}%, #ffffff33 100%)`
            }}
          />
          <span className="text-white/70 text-sm min-w-[40px]">
            {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => skipTime(-10)}
            className="text-mystical-accent hover:bg-mystical-accent/10"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            onClick={togglePlayPause}
            className="mystical-button w-12 h-12 rounded-full"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => skipTime(10)}
            className="text-mystical-accent hover:bg-mystical-accent/10"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-mystical-accent" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-mystical-accent hover:bg-mystical-accent/10"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AudioPlayer;
