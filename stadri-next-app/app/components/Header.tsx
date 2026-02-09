'use client';

import { useGame } from '../context/GameContext';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const { gameState } = useGame();
  const pathname = usePathname();
  const router = useRouter();
  
  // タイトル画面とセットアップ画面では進行バーを非表示
  const showProgress = pathname !== '/' && pathname !== '/setup' && pathname !== '/rule';
  
  // 戻るボタンの表示条件とナビゲーション
  const getBackNavigation = () => {
    if (pathname === '/') return null;
    if (pathname === '/setup') return { label: '← タイトル', path: '/' };
    if (pathname === '/rule') return { label: '← タイトル', path: '/' };
    if (pathname === '/game/confirm') return { label: '← 設定', path: '/setup' };
    if (pathname === '/game/thinking') return { label: '← 確認', path: '/game/confirm' };
    if (pathname === '/game/pitch') return { label: '← シンキング', path: '/game/thinking' };
    if (pathname === '/game/invest') return { label: '← プレゼン', path: '/game/pitch' };
    if (pathname === '/game/gacha') return { label: '← 投資', path: '/game/invest' };
    if (pathname === '/game/rank') return { label: '← タイトル', path: '/' };
    return null;
  };
  
  const backNav = getBackNavigation();
  
  return (
    <header className="game-header">
      <div className="header-content">
        <div className="header-top">
          {backNav && (
            <button className="header-back-btn" onClick={() => router.push(backNav.path)}>
              {backNav.label}
            </button>
          )}
          <h1 className="header-title">STARTUP DREAMER</h1>
          {showProgress && gameState.players.length > 0 && (
            <div className="header-round-display">ROUND {gameState.curR}</div>
          )}
        </div>
        {showProgress && gameState.players.length > 0 && (
          <div className="progress-container">
            <div className="progress-label">進行状況</div>
            <div className="progress-bar">
              {[1, 2, 3].map((round) => (
                <div 
                  key={round}
                  className={`progress-segment ${gameState.curR >= round ? 'active' : ''} ${gameState.curR === round ? 'current' : ''}`}
                >
                  <span className="round-number">R{round}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
