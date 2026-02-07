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

  const confirmBack = () => {
      if (gameState.pIdx > 0) {
          setGameState({ ...gameState, pIdx: gameState.pIdx - 1 });
          setOdaiRevealed(false);
      } else {
          router.push('/setup');
      }
  };

  return (
    <div className="container">
      <div id="confirm-all-screen" className="screen active">
        <button className="back-btn" onClick={confirmBack}>← 設定に戻る</button>
        <h3 id="round-label-confirm">ROUND {gameState.curR}</h3>
        <h2>お題の確認</h2>
        <p><b>{currentPlayer?.name}</b> さん</p>
        <p>あなたのお題はこちらです</p>
        <div id="odai-box" onClick={() => setOdaiRevealed(true)} style={{cursor: 'pointer'}}>
            {odaiRevealed ? (
                <>
                    <div style={{color:'var(--primary)', fontSize:'0.9rem'}}>ターゲット：{currentOdai?.cat}</div>
                    <div style={{fontSize:'1.1rem', fontWeight:'bold'}}>{currentOdai?.prob}</div>
                </>
            ) : (
                <span>（タップして確認）</span>
            )}
        </div>
        <button className="main-btn" onClick={nextConfirm}>お題を確認して次へ</button>
      </div>
    </div>
  );
}
