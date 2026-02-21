'use client';

import { useRouter } from 'next/navigation';
import { useGame } from '@/app/context/GameContext';
import PlayerAvatar from '@/app/components/PlayerAvatar';

export default function ConfirmPage() {
  const router = useRouter();
  const { gameState, setGameState, odaiRevealed, setOdaiRevealed } = useGame();
  
  const currentPlayerIdx = gameState.pIdx;
  const currentPlayer = gameState.players[currentPlayerIdx];
  const currentOdai = gameState.playerOdai[currentPlayerIdx];

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

        {/* 全プレイヤーの進行アバター */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
          {gameState.players.map((p, i) => (
            <PlayerAvatar
              key={i}
              name={p.name}
              turnOrder={i}
              size={i === currentPlayerIdx ? 72 : 48}
              isMe={i === currentPlayerIdx}
              status={i < currentPlayerIdx ? 'done' : i === currentPlayerIdx ? 'current' : 'pending'}
            />
          ))}
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
