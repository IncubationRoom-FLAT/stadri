'use client';

import { useRouter } from 'next/navigation';
import { useGame } from '@/app/context/GameContext';

export default function ConfirmPage() {
  const router = useRouter();
  const { gameState, setGameState, odaiRevealed, setOdaiRevealed } = useGame();
  
  const currentPlayer = gameState.players[gameState.pIdx];
  const currentOdai = gameState.playerOdai[gameState.pIdx];

  const nextConfirm = () => {
    if (gameState.pIdx < gameState.players.length - 1) {
        setGameState({ ...gameState, pIdx: gameState.pIdx + 1 });
        setOdaiRevealed(false);
    } else {
        router.push('/game/thinking');
    }
  };

  return (
    <div className="container">
      <div id="confirm-all-screen" className="screen active">
        <h2>お題の確認</h2>
        
        <div className="info-card player-card">
          <div className="card-value">{currentPlayer?.name} <span className="card-label-inline">さん</span></div>
        </div>
        
        <p className="instruction-text">あなたのお題はこちらです</p>
        
        <div id="odai-box" onClick={() => setOdaiRevealed(true)} style={{cursor: 'pointer'}}>
            {odaiRevealed ? (
                <>
                    <div className="odai-category">ターゲット：{currentOdai?.cat}</div>
                    <div className="odai-problem">{currentOdai?.prob}</div>
                </>
            ) : (
                <span className="tap-prompt">（タップして確認）</span>
            )}
        </div>
        <button className="main-btn" onClick={nextConfirm}>お題を確認して次へ</button>
      </div>
    </div>
  );
}
