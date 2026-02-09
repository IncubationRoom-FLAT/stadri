'use client';

import { useRouter } from 'next/navigation';
import { useGame } from '@/app/context/GameContext';

export default function RankPage() {
  const router = useRouter();
  const { gameState } = useGame();

  return (
    <div className="container">
      <div id="rank-screen" className="screen active">
          <h2>🏆 最終結果</h2>
          <div className="ranking-container">
              {gameState.finalRanking?.map((p, i) => (
                  <div key={i} className={`rank-card rank-${i + 1}`}>
                      <div className="rank-position">{i + 1}</div>
                      <div className="rank-info">
                          <div className="rank-name">{p.name}</div>
                          <div className="rank-score">{p.score} <span className="unit">SC</span></div>
                      </div>
                  </div>
              ))}
          </div>
          <button className="main-btn" onClick={() => router.push('/')}>タイトルに戻る</button>
      </div>
    </div>
  );
}
