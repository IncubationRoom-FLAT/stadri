'use client';

import { useRouter } from 'next/navigation';
import { useGame } from '@/app/context/GameContext';

export default function RankPage() {
  const router = useRouter();
  const { gameState } = useGame();

  return (
    <div className="container">
      <div id="rank-screen" className="screen active">
          <h2>最終結果</h2>
          <ol className="rank-list">
              {gameState.finalRanking?.map((p, i) => (
                  <li key={i}>
                      <span className="rank-name">{p.name}</span>
                      <span className="rank-score">{p.score} SC</span>
                  </li>
              ))}
          </ol>
          <button className="main-btn" onClick={() => router.push('/')}>タイトルに戻る</button>
      </div>
    </div>
  );
}
