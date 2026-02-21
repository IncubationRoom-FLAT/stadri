'use client';

import { useRouter } from 'next/navigation';
import { useGame } from '@/app/context/GameContext';
import PlayerAvatar from '@/app/components/PlayerAvatar';
import type { AvatarStatus } from '@/app/components/PlayerAvatar';

export default function PitchPage() {
  const router = useRouter();
  const { gameState, setGameState } = useGame();
  
  const presenterIdx = gameState.pIdx;
  const currentPresenter = gameState.players[presenterIdx];
  const currentOdai = gameState.playerOdai[presenterIdx];

  const nextPitch = () => {
      if (gameState.pIdx < gameState.players.length - 1) {
          setGameState({ ...gameState, pIdx: gameState.pIdx + 1 });
      } else {
          setGameState({ ...gameState, pIdx: 0, invIdx: 0 });
          router.push('/game/invest');
      }
  };

  return (
    <div className="container">
      <div id="pitch-screen" className="screen active">
          <h2>プレゼンタイム</h2>

          {/* 発表順プログレス */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
            {gameState.players.map((p, i) => {
              const st: AvatarStatus =
                i < presenterIdx ? 'done' : i === presenterIdx ? 'current' : 'pending';
              return (
                <PlayerAvatar
                  key={i}
                  name={p.name}
                  turnOrder={i}
                  size={st === 'current' ? 72 : 48}
                  status={st}
                />
              );
            })}
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
