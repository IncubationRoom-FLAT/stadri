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

  const pitchBack = () => {
      if (gameState.pIdx > 0) {
          setGameState({ ...gameState, pIdx: gameState.pIdx - 1 });
      } else {
          router.push('/game/thinking');
      }
  };

  return (
    <div className="container">
      <div id="pitch-screen" className="screen active">
          <button className="back-btn" onClick={pitchBack}>← 戻る</button>
          <h3>ROUND {gameState.curR}</h3>
          <h2>プレゼンタイム</h2>
          <p><b>{currentPresenter?.name}</b>さんの番です</p>
          <div className="odai-display">
              <p><b>お題：</b>{currentOdai?.prob}</p>
          </div>
          <p>アイデアをプレゼンしてください</p>
          <button className="main-btn" onClick={nextPitch}>次の人へ</button>
      </div>
    </div>
  );
}
