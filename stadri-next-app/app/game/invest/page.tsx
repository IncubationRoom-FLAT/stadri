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

  const investBack = () => {
      let prevInvIdx = gameState.invIdx - 1;
      
      // 自分自身への投資はスキップ
      if (prevInvIdx === gameState.pIdx) {
          prevInvIdx--;
      }

      if (prevInvIdx >= 0) {
          setGameState({ ...gameState, invIdx: prevInvIdx });
      } else {
          // 前のプレゼンターへ戻る
          let prevPIdx = gameState.pIdx - 1;
          
          if (prevPIdx >= 0) {
              const lastInvIdx = gameState.players.length - 1 === prevPIdx 
                  ? gameState.players.length - 2 
                  : gameState.players.length - 1;
              setGameState({ ...gameState, pIdx: prevPIdx, invIdx: lastInvIdx });
          } else {
              router.push('/game/pitch');
          }
      }
  };

  return (
    <div className="container">
      <div id="invest-screen" className="screen active">
          <button className="back-btn" onClick={investBack}>← 戻る</button>
          <h3>ROUND {gameState.curR}</h3>
          <h2>投資タイム</h2>
          <p><b>{currentPresenter?.name}</b>さんのプレゼン</p>
          <p>投資家：<b>{currentInvestor?.name}</b>さん</p>
          <p>あなたの所持金: {currentInvestor?.sc} SC</p>
          <p>投資額を決めてください (上限: {Math.min(gameState.curR * 3, currentInvestor?.sc || 0)} SC)</p>
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
