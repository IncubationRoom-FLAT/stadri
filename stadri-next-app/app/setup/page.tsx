'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '../context/GameContext';

export default function SetupPage() {
  const router = useRouter();
  const { setGameState, ODAIS } = useGame();
  const [numPlayers, setNumPlayers] = useState(3);
  const [playerNames, setPlayerNames] = useState(Array(3).fill(''));

  const handleNumPlayersChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const n = parseInt(e.target.value);
    setNumPlayers(n);
    setPlayerNames(Array(n).fill(''));
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayerNames = [...playerNames];
    newPlayerNames[index] = name;
    setPlayerNames(newPlayerNames);
  };

  const initGame = () => {
    const newPlayers = playerNames.map((name, i) => ({
        name: name || `プレイヤー ${i + 1}`,
        sc: 10,
        debt: 0
    }));

    let globalOdaiPool: any[] = [];
    Object.keys(ODAIS).forEach(cat => {
        ODAIS[cat as keyof typeof ODAIS].forEach((prob: string) => {
            globalOdaiPool.push({ cat, prob });
        });
    });
    globalOdaiPool.sort(() => Math.random() - 0.5);

    setGameState({
        players: newPlayers,
        curR: 1,
        pIdx: 0,
        invIdx: 0,
        invests: new Array(newPlayers.length).fill(0),
        modes: new Array(newPlayers.length).fill('Low'),
        invLog: [],
        playerOdai: newPlayers.map(() => globalOdaiPool.pop()),
        gachaResult: null,
    });
    
    router.push('/game/confirm');
  };

  return (
    <div className="container">
      <div id="setup-screen" className="screen active">
          <h2>ゲーム設定</h2>
          <h3>参加人数</h3>
          <select id="num-players" value={numPlayers} onChange={handleNumPlayersChange}>
              {[...Array(4)].map((_, i) => <option key={i} value={i + 2}>{i + 2}人</option>)}
          </select>
          <div id="name-area">
              {[...Array(numPlayers)].map((_, i) => (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <input 
                    type="text" 
                    value={playerNames[i]}
                    onChange={(e) => handlePlayerNameChange(i, e.target.value)}
                    placeholder={`プレイヤー ${i + 1} の名前`} 
                  />
                </div>
              ))}
          </div>
          <button className="main-btn" onClick={initGame}>この内容で始める</button>
      </div>
    </div>
  );
}
