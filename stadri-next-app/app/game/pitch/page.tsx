'use client';

import { useRouter } from 'next/navigation';
import { useGame } from '@/app/context/GameContext';

export default function PitchPage() {
  const router = useRouter();
  const { gameState, setGameState } = useGame();
  
  const currentPresenter = gameState.players[gameState.pIdx];
  const currentOdai = gameState.playerOdai[gameState.pIdx];

  const nextPitch = () => {
      if (gameState.pIdx < gameState.players.length - 1) {
          setGameState({ ...gameState, pIdx: gameState.pIdx + 1 });
      } else {
          // 全員のプレゼンが終わったので投資画面へ
          setGameState({ ...gameState, pIdx: 0, invIdx: 0 });
          router.push('/game/invest');
      }
  };

  return (
    <div className="container">
      <div id="pitch-screen" className="screen active">
          <h2>プレゼンタイム</h2>
          
          <div className="info-card presenter-card">
            <div className="card-label">プレゼンター</div>
            <div className="card-value">{currentPresenter?.name}</div>
          </div>
          
          <div className="odai-display">
              <div className="odai-label">お題</div>
              <div className="odai-content">{currentOdai?.prob}</div>
          </div>
          
          <p className="instruction-text">アイデアをプレゼンしてください</p>
          <button className="main-btn" onClick={nextPitch}>次の人へ</button>
      </div>
    </div>
  );
}
