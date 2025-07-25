import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface TimerProps {
  initialTime: number; // in seconds
  onTimeUp: () => void;
  isActive: boolean;
}

const Timer: React.FC<TimerProps> = ({ initialTime, onTimeUp, isActive }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const percentage = (timeLeft / initialTime) * 100;
    if (percentage > 50) return 'text-green-600 bg-green-100';
    if (percentage > 20) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const isLowTime = timeLeft <= initialTime * 0.2; // 20% or less remaining

  return (
    <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${getTimerColor()} ${isLowTime ? 'animate-pulse' : ''}`}>
      {isLowTime ? (
        <AlertTriangle className="w-5 h-5" />
      ) : (
        <Clock className="w-5 h-5" />
      )}
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
};

export default Timer;