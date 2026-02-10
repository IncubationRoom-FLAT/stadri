'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useGame } from '@/app/context/GameContext';

export default function GachaPage() {
  const router = useRouter();
  const { 
    gameState, 
    setGameState, 
    isRolling, 
    setIsRolling,
    rouletteResult,
    setRouletteResult,
    slotResults,
    setSlotResults,
    successRate,
    setSuccessRate,
    GACHA_RATES,
    GACHA_RESULTS,
    ODAIS,
    setOdaiRevealed
  } = useGame();
  
  const needleRef = useRef<HTMLDivElement>(null);
  const [rocketImage, setRocketImage] = useState<string | null>(null);
  const [showResultPopup, setShowResultPopup] = useState(false);
  
  const currentPresenter = gameState.players[gameState.pIdx];
  const currentPresenterInvest = gameState.invests[gameState.pIdx] || 0;

  useEffect(() => {
    // ページロード時に成功率を計算
    const totalInvest = gameState.invests[gameState.pIdx] || 0;
    const mode = gameState.modes[gameState.pIdx];
    const probMult = mode === 'High' ? 0.5 : 1.0;
    const rate = ((totalInvest + 0.1) / (totalInvest + 1.1)) * probMult;
    setSuccessRate(rate);
  }, [gameState.pIdx, gameState.invests, gameState.modes, setSuccessRate]);

  const handleModeChange = (newMode: string) => {
      const newModes = [...gameState.modes];
      newModes[gameState.pIdx] = newMode;
      setGameState({ ...gameState, modes: newModes });
      
      // モード変更時に成功率を再計算
      const totalInvest = gameState.invests[gameState.pIdx] || 0;
      const probMult = newMode === 'High' ? 0.5 : 1.0;
      const rate = ((totalInvest + 0.1) / (totalInvest + 1.1)) * probMult;
      setSuccessRate(rate);
  };

  const roll = () => {
      if (isRolling) return;
      setIsRolling(true);
      setRouletteResult(null);
      setShowResultPopup(false);

      const totalInvest = gameState.invests[gameState.pIdx] || 0;
      const mode = gameState.modes[gameState.pIdx];
      
      const rate = GACHA_RATES[mode as keyof typeof GACHA_RATES];
      const randomValue = Math.random();
      const isSuccess = randomValue < rate.success;
      
      console.log('=== Gacha Roll ===');
      console.log('Round:', gameState.curR);
      console.log('Mode:', mode);
      console.log('Success Rate:', rate.success);
      console.log('Random Value:', randomValue);
      console.log('Is Success:', isSuccess);
      
      // ラウンドに応じた演出
      if (gameState.curR === 2) {
          performRouletteAnimation(isSuccess);
      } else if (gameState.curR === 3) {
          performRocketAnimation(isSuccess);
      } else {
          performSlotAnimation(isSuccess);
      }
  };

  const performRouletteAnimation = (isSuccess: boolean) => {
      const totalInvest = gameState.invests[gameState.pIdx] || 0;
      const mode = gameState.modes[gameState.pIdx];
      const probMult = mode === 'High' ? 0.5 : 1.0;
      const successRate = ((totalInvest + 0.1) / (totalInvest + 1.1)) * probMult;
      
      let winCount = Math.round(successRate * 12);
      if (winCount === 0 && successRate > 0) winCount = 1;
      if (winCount === 12) winCount = 11;
      
      const spots = Array(12).fill(false);
      for (let i = 0; i < winCount; i++) {
          spots[i] = true;
      }
      spots.sort(() => Math.random() - 0.5);
      
      const targetSpots = spots.map((win, idx) => ({ idx, win }));
      const matchingSpots = targetSpots.filter(s => s.win === isSuccess);
      const winningSpot = matchingSpots[Math.floor(Math.random() * matchingSpots.length)];
      
      if (needleRef.current) {
          const spins = 3600;
          const targetDeg = winningSpot.idx * 30;
          const totalDeg = spins + targetDeg;
          
          needleRef.current.style.transition = 'none';
          needleRef.current.style.transform = 'rotate(0deg)';
          
          setTimeout(() => {
              if (needleRef.current) {
                  needleRef.current.style.transition = 'transform 5s cubic-bezier(0.15, 0, 0.15, 1)';
                  needleRef.current.style.transform = `rotate(${totalDeg}deg)`;
              }
              
              setTimeout(() => {
                  finalizeGachaResult(isSuccess);
              }, 5500);
          }, 100);
      }
  };

  const performSlotAnimation = async (isSuccess: boolean) => {
      const URL_SUCCESS = "/image3.jpg";
      const URL_FAIL = "/image1.jpg";
      
      const targetSymbol = isSuccess ? URL_SUCCESS : URL_FAIL;
      
      const totalInvest = gameState.invests[gameState.pIdx] || 0;
      const mode = gameState.modes[gameState.pIdx];
      const probMult = mode === 'High' ? 0.5 : 1.0;
      const rate = ((totalInvest + 0.1) / (totalInvest + 1.1)) * probMult;
      
      for (let i = 0; i < 3; i++) {
          await new Promise<void>((resolve) => {
              let spinCount = 0;
              const spinInterval = setInterval(() => {
                  const randomSymbol = Math.random() < rate ? URL_SUCCESS : URL_FAIL;
                  setSlotResults(prev => {
                      const newResults = [...prev];
                      newResults[i] = randomSymbol;
                      return newResults;
                  });
                  spinCount++;
                  if (spinCount > 10) {
                      clearInterval(spinInterval);
                      setSlotResults(prev => {
                          const newResults = [...prev];
                          newResults[i] = targetSymbol;
                          return newResults;
                      });
                      setTimeout(resolve, 500);
                  }
              }, 100);
          });
      }
      
      setTimeout(() => {
          finalizeGachaResult(isSuccess);
      }, 1000);
  };

  const performRocketAnimation = async (isSuccess: boolean) => {
      console.log('Rocket Animation - isSuccess:', isSuccess);
      
      // 共通フレーム1
      setRocketImage('/success_rocket1.png');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 共通フレーム2
      setRocketImage('/success_rocket2.png');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 少し間を開ける
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 結果に応じたフレーム3
      const frame3 = isSuccess ? '/success_rocket3.png' : '/fail_rocket3.png';
      console.log('Frame 3:', frame3);
      setRocketImage(frame3);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 結果に応じたフレーム4
      const frame4 = isSuccess ? '/success_rocket4.png' : '/fail_rocket4.png';
      console.log('Frame 4:', frame4);
      setRocketImage(frame4);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // アニメーション完了後に結果を確定
      console.log('Finalizing with isSuccess:', isSuccess);
      finalizeGachaResult(isSuccess);
  };

  const finalizeGachaResult = (isSuccess: boolean) => {
      console.log('=== Finalize Gacha Result ===');
      console.log('isSuccess:', isSuccess);
      
      const totalInvest = gameState.invests[gameState.pIdx] || 0;
      const mode = gameState.modes[gameState.pIdx];
      const resultKey = isSuccess ? 'success' : 'fail';
      const multipliers = GACHA_RESULTS[mode as keyof typeof GACHA_RESULTS][resultKey as keyof typeof GACHA_RESULTS.Low];
      const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
      const gain = Math.round(totalInvest * multiplier);

      console.log('Result Key:', resultKey);
      console.log('Gain:', gain);

      const logEntry = {
          round: gameState.curR,
          presenter: currentPresenter.name,
          totalInvest,
          mode,
          isSuccess,
          gain,
          investors: [] as any[]
      };

      let newPlayers = JSON.parse(JSON.stringify(gameState.players));
      if (isSuccess) {
          newPlayers[gameState.pIdx].sc += gain;
          gameState.invests.forEach((amount, invIdx) => {
              if (amount > 0 && invIdx !== gameState.pIdx) {
                  const bonus = Math.round(amount * 0.5);
                  newPlayers[invIdx].sc += bonus;
                  logEntry.investors.push({ name: gameState.players[invIdx].name, amount, bonus });
              }
          });
      } else {
          newPlayers[gameState.pIdx].debt += Math.abs(gain);
          gameState.invests.forEach((amount, invIdx) => {
              if (amount > 0 && invIdx !== gameState.pIdx) {
                  logEntry.investors.push({ name: gameState.players[invIdx].name, amount, bonus: 0 });
              }
          });
      }

      setIsRolling(false);
      setRouletteResult(isSuccess ? 'SUCCESS' : 'FAIL');
      setGameState({
          ...gameState,
          players: newPlayers,
          invLog: [...gameState.invLog, logEntry],
          gachaResult: { isSuccess, gain }
      });
      
      // POPUP表示
      setShowResultPopup(true);
  };

  const nextG = () => {
      if (gameState.pIdx < gameState.players.length - 1) {
          const nextPIdx = gameState.pIdx + 1;
          const totalInvest = gameState.invests[nextPIdx] || 0;
          const mode = gameState.modes[nextPIdx];
          const probMult = mode === 'High' ? 0.5 : 1.0;
          const rate = ((totalInvest + 0.1) / (totalInvest + 1.1)) * probMult;
          
          setSuccessRate(rate);
          setGameState({ ...gameState, pIdx: nextPIdx, gachaResult: null });
          setIsRolling(false);
          setRouletteResult(null);
          setSlotResults([null, null, null]);
          setRocketImage(null);
          setShowResultPopup(false);
      } else {
          if (gameState.curR < 3) {
              let globalOdaiPool: any[] = [];
              Object.keys(ODAIS).forEach(cat => {
                  ODAIS[cat as keyof typeof ODAIS].forEach((prob: string) => {
                      globalOdaiPool.push({ cat, prob });
                  });
              });
              globalOdaiPool.sort(() => Math.random() - 0.5);
              
              setGameState({
                  ...gameState,
                  curR: gameState.curR + 1,
                  pIdx: 0,
                  playerOdai: gameState.players.map(() => globalOdaiPool.pop()),
                  invests: new Array(gameState.players.length).fill(0),
                  modes: new Array(gameState.players.length).fill('Low'),
                  gachaResult: null
              });
              setOdaiRevealed(false);
              setRocketImage(null);
              setShowResultPopup(false);
              router.push('/game/confirm');
          } else {
              const finalScores = gameState.players.map(p => ({
                  name: p.name,
                  score: p.sc - p.debt
              })).sort((a, b) => b.score - a.score);
              setGameState({ ...gameState, finalRanking: finalScores });
              router.push('/game/rank');
          }
      }
  };

  return (
    <div className="container">
      <div id="gacha-screen" className="screen active">
          <h2>ガチャタイム</h2>
          
          <div className="info-card presenter-card">
            <div className="card-label">挑戦者</div>
            <div className="card-value">{currentPresenter?.name}</div>
          </div>
          
          <div className="info-card balance-card">
            <div className="card-label">集めた資金額</div>
            <div className="card-value highlight-amount">{currentPresenterInvest} <Image src="/coin.png" alt="coin" width={24} height={24} className="coin-icon" /></div>
          </div>
          
          <div className="success-rate-bar">
              <div className="rate-bar-fill" style={{ width: `${successRate * 100}%` }}></div>
              <div className="rate-bar-label">
                  成功確率: {Math.round(successRate * 100)}%
              </div>
          </div>
          
          <div className="mode-selector">
              <button className={`mode-btn ${gameState.modes[gameState.pIdx] === 'Low' ? 'active' : ''}`} onClick={() => handleModeChange('Low')}>ローリスク</button>
              <button className={`mode-btn ${gameState.modes[gameState.pIdx] === 'High' ? 'active' : ''}`} onClick={() => handleModeChange('High')}>ハイリスク</button>
          </div>
          
          {gameState.curR === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0', width: '100%' }}>
                    <div id="roulette-board" style={{ width: 'min(350px, 90vw)', height: 'min(350px, 90vw)', maxWidth: '350px', maxHeight: '350px', borderRadius: '50%', border: '10px solid var(--gold)', position: 'relative', background: 'radial-gradient(#fff, #f0f0f0)', overflow: 'hidden', boxShadow: '0 0 25px rgba(0,0,0,0.3)' }}>
                        {Array.from({ length: 12 }).map((_, i) => {
                            const isWin = i < Math.round(successRate * 12);
                            return (
                                <div key={i} style={{ position: 'absolute', width: '100%', height: '100%', transform: `rotate(${i * 30}deg)`, textAlign: 'center' }}>
                                    <Image 
                                        src={isWin ? "/image3.jpg" : "/image1.jpg"} 
                                        alt={isWin ? "success" : "fail"}
                                        width={60} 
                                        height={60}
                                        style={{ position: 'absolute', top: '20px', left: 'calc(50% - 30px)', transform: `rotate(-${i * 30}deg)` }}
                                    />
                                </div>
                            );
                        })}
                        
                        <div ref={needleRef} style={{ position: 'absolute', top: 0, left: 'calc(50% - 4px)', width: '8px', height: '50%', background: '#ff4d4d', transformOrigin: 'bottom', borderRadius: '10px', zIndex: 100, boxShadow: '0 0 5px rgba(0,0,0,0.2)' }}>
                            <div style={{ width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderBottom: '24px solid #ff4d4d', position: 'absolute', top: '-20px', left: '-8px' }}></div>
                        </div>
                        
                        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '30px', height: '30px', background: 'var(--gold)', borderRadius: '50%', transform: 'translate(-50%,-50%)', zIndex: 101, border: '3px solid #fff' }}></div>
                    </div>
                    <div style={{ marginTop: '15px', fontWeight: 'bold', color: 'var(--gold)', fontSize: '1.2rem', minHeight: '1.5em' }}>
                        成功マス: {Math.round(successRate * 12)} / 12
                    </div>
                </div>
            )}
            
            {gameState.curR !== 2 && gameState.curR !== 3 && (
              <div className="slot-container" style={{ display: 'flex', justifyContent: 'center', gap: '15px', margin: '25px 0', width: '100%', flexWrap: 'wrap' }}>
                  {[0, 1, 2].map((i) => (
                      <div key={i} className="slot-reel-window" style={{ width: 'min(140px, 28vw)', height: 'min(160px, 32vw)', maxWidth: '140px', maxHeight: '160px', overflow: 'hidden', background: '#fff', border: '5px solid var(--gold)', borderRadius: '10px' }}>
                          <div className="slot-char" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {slotResults[i] && (
                                  <Image 
                                      src={slotResults[i]!} 
                                      alt="slot"
                                      width={130} 
                                      height={130}
                                      style={{ objectFit: 'contain', width: '90%', height: 'auto' }}
                                  />
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          )}
          
          {gameState.curR === 3 && (
              <div className="rocket-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', margin: '40px 0', width: '100%', minHeight: '400px', background: 'transparent' }}>
                  {rocketImage && (
                      <Image 
                          src={rocketImage} 
                          alt="rocket animation"
                          width={300} 
                          height={400}
                          style={{ objectFit: 'contain', width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '400px', background: 'transparent' }}
                          priority
                      />
                  )}
              </div>
          )}
          
          {!gameState.gachaResult && <button className="main-btn" onClick={roll} disabled={isRolling}>{isRolling ? '抽選中...' : '運命の判定！'}</button>}
          {gameState.gachaResult && <button className="main-btn" onClick={nextG}>次へ進む</button>}
          
          {/* 結果POPUP */}
          {showResultPopup && gameState.gachaResult && (
              <div className="result-popup-overlay" onClick={() => setShowResultPopup(false)}>
                  <div className="result-popup" onClick={(e) => e.stopPropagation()}>
                      <div className={`result-popup-content ${gameState.gachaResult.isSuccess ? 'success' : 'failure'}`}>
                          <h2 className="result-title">
                              {gameState.gachaResult.isSuccess ? 'SUCCESS!!' : 'FAILURE...'}
                          </h2>
                          <p className="result-amount">
                              {gameState.gachaResult.isSuccess ? '獲得資金' : '負債額'}: 
                              <span className="amount-value">{Math.abs(gameState.gachaResult.gain)} <Image src="/coin.png" alt="coin" width={28} height={28} className="coin-icon" /></span>
                          </p>
                          <button className="popup-close-btn" onClick={() => setShowResultPopup(false)}>
                              閉じる
                          </button>
                      </div>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
}
