import React,{ useState, useEffect } from 'react';

export function CountdownTimer({ endsAt, serverTime, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const serverOffset = serverTime - now;
      const adjustedNow = now + serverOffset;
      const endTime = new Date(endsAt).getTime();
      const remaining = Math.max(0, endTime - adjustedNow);

      return remaining;
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0 && onExpire) {
        onExpire();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [endsAt, serverTime, onExpire]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const isUrgent = timeLeft < 60000;
  const hasEnded = timeLeft === 0;

  return (
    <div
      className={`text-sm font-semibold ${
        hasEnded
          ? 'text-gray-500'
          : isUrgent
          ? 'text-red-600 animate-pulse'
          : 'text-gray-700'
      }`}
    >
      {hasEnded ? 'Ended' : formatTime(timeLeft)}
    </div>
  );
}
