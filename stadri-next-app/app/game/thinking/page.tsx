'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/app/context/GameContext';

export default function ThinkingPage() {
  const router = useRouter();
  const { gameState, setGameState, timeLeft, setTimeLeft, timerActive, setTimerActive } = useGame();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if(timerRef.current) clearInterval(timerRef.current);
      setTimerActive(false);
    }
    return () => {
        if(timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timeLeft, setTimeLeft, setTimerActive]);

  const toggleTimer = () => {
    setTimerActive(!timerActive);
  };

  const adjustTime = (amount: number) => {
    let newTime = timeLeft + amount;
    if (newTime < 180) newTime = 180;
    if (newTime > 600) newTime = 600;
    setTimeLeft(newTime);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const showPitch = () => {
      setTimerActive(false);
      setGameState({ ...gameState, pIdx: 0 });
      router.push('/game/pitch');
  };

  return (
    <div className="container">
      <div id="thinking-screen" className="screen active">
        <h2 className="thinking-title">💡 Thinking Time</h2>
        
        <div className="timer-controls">
            <button className="timer-adjust-btn" onClick={() => adjustTime(-30)}>-30s</button>
            <div id="think-timer" className="timer-display">{formatTime(timeLeft)}</div>
            <button className="timer-adjust-btn" onClick={() => adjustTime(30)}>+30s</button>
        </div>
        
        <button id="timer-toggle-btn" className="main-btn timer-toggle" onClick={toggleTimer}>
          {timerActive ? 'ストップ' : 'スタート'}
        </button>
        
        <button className="next-btn accent-btn" onClick={showPitch}>プレゼンを開始する</button>
      </div>
    </div>
  );
}
