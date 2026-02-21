'use client';

import { useState, useEffect } from 'react';
import { useMultiRoom } from '@/app/context/MultiRoomContext';

export default function MultiConfirmPage() {
    const { myPlayer, roomState, confirmOdai, advancePhase, displayTimeLeft } = useMultiRoom();
    const [odaiRevealed, setOdaiRevealed] = useState(false);

    // Auto-advance when timer runs out
    useEffect(() => {
        if (displayTimeLeft === 0 && roomState?.phase === 'confirm') {
            advancePhase('confirm');
        }
    }, [displayTimeLeft]);

    if (!roomState || !myPlayer) {
        return (
            <div className="container">
                <div className="screen active">
                    <p>読み込み中...</p>
                </div>
            </div>
        );
    }

    const waitingPlayers = roomState.players.filter(p => !p.odaiConfirmed);

    return (
        <div className="container">
            <div className="screen active">
                <h2>お題の確認</h2>

                <div
                    className="info-card"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                    }}
                >
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted, #aaa)' }}>
                        残り時間
                    </span>
                    <span
                        style={{
                            fontSize: '1.4rem',
                            fontWeight: 'bold',
                            color: displayTimeLeft <= 10 ? '#ff6b6b' : 'var(--gold, #f0c040)',
                        }}
                    >
                        {displayTimeLeft}s
                    </span>
                </div>

                <div className="info-card player-card">
                    <div className="card-value">
                        {myPlayer.name} <span className="card-label-inline">さん</span>
                    </div>
                </div>

                <p className="instruction-text">あなたのお題はこちらです</p>

                <div
                    id="odai-box"
                    onClick={() => setOdaiRevealed(true)}
                    style={{ cursor: 'pointer' }}
                >
                    {odaiRevealed ? (
                        <>
                            <div className="odai-category">
                                ターゲット：{myPlayer.odai?.cat}
                            </div>
                            <div className="odai-problem">{myPlayer.odai?.prob}</div>
                        </>
                    ) : (
                        <span className="tap-prompt">（タップして確認）</span>
                    )}
                </div>

                {myPlayer.odaiConfirmed ? (
                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        <p style={{ color: '#6bcb77', fontWeight: 'bold' }}>✓ 確認済み</p>
                        {waitingPlayers.length > 0 && (
                            <div className="info-card" style={{ marginTop: '12px' }}>
                                <div className="card-label">待機中</div>
                                {waitingPlayers.map(p => (
                                    <p key={p.id} style={{ margin: '4px 0', color: 'var(--text-muted, #aaa)' }}>
                                        ⏳ {p.name} さんの確認を待っています
                                    </p>
                                ))}
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #aaa)' }}>
                                    残り {displayTimeLeft}秒 で自動的に次へ進みます
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <button className="main-btn" onClick={confirmOdai} disabled={!odaiRevealed}>
                        お題を確認して次へ
                    </button>
                )}
            </div>
        </div>
    );
}
