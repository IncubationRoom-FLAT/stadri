'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useGame } from '@/app/context/GameContext';
import PlayerAvatar from '@/app/components/PlayerAvatar';

export default function InvestPage() {
  const router = useRouter();
  const { gameState, setGameState } = useGame();
  const [investAmount, setInvestAmount] = useState(0);
  
  const presenterIdx = gameState.pIdx;
  const investorIdx = gameState.invIdx;
  const currentPresenter = gameState.players[presenterIdx];
  const currentInvestor = gameState.players[investorIdx];
  const maxInvest = Math.min(gameState.curR * 3, currentInvestor?.sc || 0);

  const saveInv = () => {
      const amount = investAmount;
      if (amount > currentInvestor.sc) {
          alert('所持金が足りません！');
          return;
      }

      let newInvests = [...gameState.invests];
      newInvests[presenterIdx] += amount;
      
      let newPlayers = [...gameState.players];
      newPlayers[investorIdx].sc -= amount;
      
      setGameState({ ...gameState, invests: newInvests, players: newPlayers });
      skipI();
  };

  const skipI = () => {
      let nextInvIdx = gameState.invIdx + 1;
      
      if (nextInvIdx === gameState.pIdx) {
          nextInvIdx++;
      }

      if (nextInvIdx < gameState.players.length) {
          setGameState({ ...gameState, invIdx: nextInvIdx });
          setInvestAmount(0);
      } else {
          let nextPIdx = gameState.pIdx + 1;
          
          if (nextPIdx < gameState.players.length) {
              const firstInvIdx = nextPIdx === 0 ? 1 : 0;
              setGameState({ ...gameState, pIdx: nextPIdx, invIdx: firstInvIdx });
              setInvestAmount(0);
          } else {
              setGameState({ ...gameState, pIdx: 0 });
              router.push('/game/gacha');
          }
      }
  };

  const incrementAmount = () => setInvestAmount(prev => Math.min(prev + 1, maxInvest));
  const decrementAmount = () => setInvestAmount(prev => Math.max(prev - 1, 0));

  return (
    <div className="container">
      <div id="invest-screen" className="screen active">
          <h2>投資タイム</h2>

          {/* 投資家 → プレゼンター アバター（投資タイム直下） */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '12px' }}>
            <PlayerAvatar name={currentInvestor?.name ?? ''} turnOrder={investorIdx} size={78} isMe />
            <span style={{ fontSize: '1.2rem', color: 'var(--gold, #f0c040)' }}>→</span>
            <PlayerAvatar name={currentPresenter?.name ?? ''} turnOrder={presenterIdx} size={52} />
          </div>

          <div className="info-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <div className="card-label">所持金</div>
              <div className="card-value highlight-amount">
                {currentInvestor?.sc}{' '}
                <Image src="/coin.png" alt="coin" width={20} height={20} className="coin-icon-inline" />
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="card-label">上限</div>
              <div style={{ fontWeight: 'bold', color: 'var(--gold, #f0c040)' }}>{maxInvest}</div>
            </div>
          </div>

          {/* 投資額入力 */}
          <div
            className="info-card"
            style={{ padding: '14px 12px', marginBottom: '12px' }}
          >
            <div className="input-with-controls" style={{ justifyContent: 'center' }}>
              <button className="control-btn" onClick={decrementAmount}>-</button>
              <input
                type="number"
                value={investAmount}
                onChange={e => setInvestAmount(parseInt(e.target.value) || 0)}
                min="0"
                max={maxInvest}
                className="invest-input"
                style={{ width: '56px' }}
              />
              <button className="control-btn" onClick={incrementAmount}>+</button>
            </div>
          </div>

          <div className="btn-group">
              <button className="main-btn" onClick={saveInv}>投資決定</button>
          </div>
      </div>
    </div>
  );
}
