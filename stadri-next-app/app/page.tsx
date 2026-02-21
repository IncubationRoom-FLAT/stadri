'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [showModeSelect, setShowModeSelect] = useState(false);

  return (
    <div className="container">
      <div id="title-screen" className="screen active">
        <h1 className="title-logo">STARTUP<br />DREAMER</h1>

        {!showModeSelect ? (
          <>
            <button className="main-btn" onClick={() => setShowModeSelect(true)}>
              ゲームスタート
            </button>
            <button className="main-btn accent-btn" onClick={() => router.push('/rule')}>
              ルールを確認
            </button>
          </>
        ) : (
          <>
            <p style={{ marginBottom: '16px', fontSize: '1rem', color: 'var(--text-muted, #aaa)' }}>
              プレイ方法を選んでください
            </p>
            <button className="main-btn" onClick={() => router.push('/setup')}>
              🖥️　ひとつの端末でプレイ
            </button>
            <button className="main-btn" onClick={() => router.push('/multi/create')}>
              📱　複数の端末でプレイ（ルーム作成）
            </button>
            <button className="main-btn accent-btn" onClick={() => router.push('/multi/join')}>
              🔗　複数の端末でプレイ（ルームに参加）
            </button>
            <button
              className="main-btn accent-btn"
              onClick={() => setShowModeSelect(false)}
              style={{ marginTop: '8px' }}
            >
              戻る
            </button>
          </>
        )}
      </div>
    </div>
  );
}
