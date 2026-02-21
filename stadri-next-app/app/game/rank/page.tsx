'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useGame } from '@/app/context/GameContext';
import PlayerAvatar from '@/app/components/PlayerAvatar';

export default function RankPage() {
  const router = useRouter();
  const { gameState, setGameState, setOdaiRevealed, ODAIS } = useGame();

  const handlePlayAgain = () => {
    // Reset sc/debt but keep player names; generate new odai
    let globalOdaiPool: any[] = [];
    Object.keys(ODAIS).forEach(cat => {
      ODAIS[cat as keyof typeof ODAIS].forEach((prob: string) => {
        globalOdaiPool.push({ cat, prob });
      });
    });
    globalOdaiPool.sort(() => Math.random() - 0.5);

    setGameState({
      ...gameState,
      curR: 1,
      pIdx: 0,
      invIdx: 0,
      players: gameState.players.map(p => ({ ...p, sc: 10, debt: 0 })),
      invests: new Array(gameState.players.length).fill(0),
      modes: new Array(gameState.players.length).fill('Low'),
      invLog: [],
      playerOdai: gameState.players.map(() => globalOdaiPool.pop()),
      gachaResult: null,
      finalRanking: undefined,
    });
    setOdaiRevealed(false);
    router.push('/game/confirm');
  };

  return (
    <div className="container">
      <div id="rank-screen" className="screen active">
          <h2>🏆 最終結果</h2>
          <div className="ranking-container">
              {gameState.finalRanking?.map((p, i) => {
                  const playerIdx = gameState.players.findIndex(pl => pl.name === p.name);
                  const turnOrder = playerIdx >= 0 ? playerIdx : i;
                  return (
                      <div
                          key={i}
                          className={`rank-card rank-${i + 1}`}
                          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                      >
                          <div className="rank-position">{i + 1}</div>
                          <PlayerAvatar
                              name={p.name}
                              turnOrder={turnOrder}
                              size={48}
                          />
                          <div className="rank-score" style={{ marginLeft: 'auto' }}>
                              {p.score}{' '}
                              <Image src="/coin.png" alt="coin" width={24} height={24} className="coin-icon" />
                          </div>
                      </div>
                  );
              })}
          </div>
          <button className="main-btn" onClick={handlePlayAgain}>もう一度プレイ</button>
          <button className="main-btn accent-btn" onClick={() => router.push('/')}>タイトルに戻る</button>
      </div>
    </div>
  );
}
