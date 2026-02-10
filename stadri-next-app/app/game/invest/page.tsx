'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/app/context/GameContext';

export default function InvestPage() {
  const router = useRouter();
  const { gameState, setGameState } = useGame();
  const [investAmount, setInvestAmount] = useState(0);
  
  const currentPresenter = gameState.players[gameState.pIdx];
  const currentInvestor = gameState.players[gameState.invIdx];

  const saveInv = () => {
      const amount = investAmount;
      if (amount > currentInvestor.sc) {
          alert('所持金が足りません！');
          return;
      }

      let newInvests = [...gameState.invests];
      newInvests[gameState.pIdx] += amount;
      
      let newPlayers = [...gameState.players];
      newPlayers[gameState.invIdx].sc -= amount;
      
      setGameState({ ...gameState, invests: newInvests, players: newPlayers });
      skipI();
  };

  const skipI = () => {
      let nextInvIdx = gameState.invIdx + 1;
      
      // 自分自身への投資はスキップ
      if (nextInvIdx === gameState.pIdx) {
          nextInvIdx++;
      }

      if (nextInvIdx < gameState.players.length) {
          // 次の投資家へ
          setGameState({ ...gameState, invIdx: nextInvIdx });
          setInvestAmount(0);
      } else {
          // このプレゼンターへの投資が終了
          let nextPIdx = gameState.pIdx + 1;
          
          if (nextPIdx < gameState.players.length) {
              // 次のプレゼンターへの投資開始
              const firstInvIdx = nextPIdx === 0 ? 1 : 0;
              setGameState({ ...gameState, pIdx: nextPIdx, invIdx: firstInvIdx });
              setInvestAmount(0);
          } else {
              // 全員への投資が終了。ガチャ画面へ
              setGameState({ ...gameState, pIdx: 0 });
              router.push('/game/gacha');
          }
      }
  };

  return (
    <div className="container">
      <div id="invest-screen" className="screen active">
          <h2>投資タイム</h2>
          
          <div className="info-card presenter-card">
            <div className="card-label">プレゼンター</div>
            <div className="card-value">{currentPresenter?.name}</div>
          </div>
          
          <div className="info-card investor-card">
            <div className="card-label">投資家</div>
            <div className="card-value">{currentInvestor?.name}</div>
          </div>
          
          <div className="info-card balance-card">
            <div className="card-label">あなたの所持金</div>
            <div className="card-value highlight-amount">{currentInvestor?.sc} <span className="unit">SC</span></div>
          </div>
          
          <div className="instruction-box">
            <p>投資額を決めてください</p>
            <p className="limit-text">上限: {Math.min(gameState.curR * 3, currentInvestor?.sc || 0)} SC</p>
          </div>
          
          <input 
              type="number" 
              value={investAmount}
              onChange={(e) => setInvestAmount(parseInt(e.target.value) || 0)}
              min="0" 
              max={Math.min(gameState.curR * 3, currentInvestor?.sc || 0)} 
              className="invest-input" 
          />
          
          <div className="btn-group">
              <button className="main-btn" onClick={saveInv}>投資決定</button>
              <button className="main-btn accent-btn" onClick={skipI}>スキップ</button>
          </div>
      </div>
    </div>
  );
}
