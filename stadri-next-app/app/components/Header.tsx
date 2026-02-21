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
    if (pathname === '/setup') return { label: '<', path: '/' };
    if (pathname === '/rule') return { label: '<', path: '/' };
    if (pathname === '/game/confirm') return { label: '<', path: '/setup' };
    if (pathname === '/game/thinking') return { label: '<', path: '/game/confirm' };
    if (pathname === '/game/pitch') return { label: '<', path: '/game/thinking' };
    if (pathname === '/game/invest') return { label: '<', path: '/game/pitch' };
    if (pathname === '/game/gacha') return { label: '<', path: '/game/invest' };
    if (pathname === '/game/rank') return { label: '<', path: '/' };
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
        </div>
        {showProgress && gameState.players.length > 0 && (
          <div className="progress-container">
            <div className="progress-bar">
              <div className={`progress-round ${gameState.curR > 1 ? 'completed' : gameState.curR === 1 ? 'current' : 'pending'}`}>
                ROUND1
              </div>
              <div className="progress-separator">&gt;</div>
              <div className={`progress-round ${gameState.curR > 2 ? 'completed' : gameState.curR === 2 ? 'current' : 'pending'}`}>
                ROUND2
              </div>
              <div className="progress-separator">&gt;</div>
              <div className={`progress-round ${gameState.curR > 3 ? 'completed' : gameState.curR === 3 ? 'current' : 'pending'}`}>
                ROUND3
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
