'use client';

import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useMultiRoom } from '../context/MultiRoomContext';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const { gameState, setGameState } = useGame();
  const { roomId, endGame } = useMultiRoom();
  const pathname = usePathname();
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  // タイトル画面とセットアップ画面では進行バーを非表示
  const showProgress = pathname !== '/' && pathname !== '/setup' && pathname !== '/rule';

  // ゲーム終了ボタンの表示条件：ゲームページまたはマルチページ
  const showEndBtn =
    pathname.startsWith('/game/') ||
    pathname.startsWith('/multi/');

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

  const handleEndGame = async () => {
    setShowConfirm(false);
    if (roomId) {
      // オンライン対戦：ルーム全体を終了
      await endGame();
    } else {
      // シングルデバイス：ゲーム状態をリセット
      setGameState({
        players: [],
        curR: 1,
        pIdx: 0,
        invIdx: 0,
        invests: [],
        modes: [],
        invLog: [],
        playerOdai: [],
        gachaResult: null,
      });
      router.push('/');
    }
  };

  return (
    <>
      <header className="game-header">
        <div className="header-content">
          <div className="header-top">
            {backNav && (
              <button className="header-back-btn" onClick={() => router.push(backNav.path)}>
                {backNav.label}
              </button>
            )}
            <h1 className="header-title">STARTUP DREAMER</h1>
            {showEndBtn && (
              <button className="header-end-btn" onClick={() => setShowConfirm(true)}>
                終了
              </button>
            )}
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

      {showConfirm && (
        <div className="end-game-overlay">
          <div className="end-game-dialog">
            <h3>ゲームを終了しますか？</h3>
            {roomId ? (
              <p>全プレイヤーのゲームが終了し、ルームが削除されます。<br />よろしいですか？</p>
            ) : (
              <p>ゲームを終了してトップ画面に戻ります。<br />よろしいですか？</p>
            )}
            <div className="end-game-dialog-btns">
              <button className="end-game-cancel-btn" onClick={() => setShowConfirm(false)}>
                キャンセル
              </button>
              <button className="end-game-confirm-btn" onClick={handleEndGame}>
                終了する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

}
