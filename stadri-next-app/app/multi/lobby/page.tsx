'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMultiRoom } from '@/app/context/MultiRoomContext';

export default function LobbyPage() {
    const router = useRouter();
    const { roomId, roomState, myPlayer, startGame, error } = useMultiRoom();

    // Redirect if no room
    useEffect(() => {
        if (!roomId) router.push('/');
    }, [roomId, router]);

    if (!roomState) {
        return (
            <div className="container">
                <div className="screen active">
                    <p>接続中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="screen active">
                <h2>待機中</h2>

                <div className="info-card" style={{ marginBottom: '16px' }}>
                    <div className="card-label">ルームID</div>
                    <div className="card-value" style={{ fontSize: '1.4rem', letterSpacing: '2px' }}>
                        {roomId}
                    </div>
                </div>

                <p className="instruction-text">
                    参加者がルームIDを入力して参加できます
                </p>

                <div className="setup-section">
                    <h3>参加中のプレイヤー ({roomState.players.length}人)</h3>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            marginTop: '10px',
                        }}
                    >
                        {roomState.players.map(p => (
                            <div
                                key={p.id}
                                className="info-card player-card"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 16px',
                                    border:
                                        p.id === myPlayer?.id
                                            ? '2px solid var(--gold, #f0c040)'
                                            : undefined,
                                }}
                            >
                                <span style={{ fontWeight: 'bold' }}>
                                    {p.name}
                                    {p.id === myPlayer?.id && ' (あなた)'}
                                </span>
                                {p.isOwner && (
                                    <span
                                        style={{
                                            fontSize: '0.75rem',
                                            background: 'var(--gold, #f0c040)',
                                            color: '#000',
                                            padding: '2px 8px',
                                            borderRadius: '10px',
                                        }}
                                    >
                                        オーナー
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {error && (
                    <p style={{ color: '#ff6b6b', margin: '8px 0' }}>{error}</p>
                )}

                {myPlayer?.isOwner ? (
                    <>
                        <p
                            style={{
                                fontSize: '0.85rem',
                                color: 'var(--text-muted, #aaa)',
                                marginBottom: '12px',
                            }}
                        >
                            全員が参加したことを確認してからゲームを開始してください（2人以上必要）
                        </p>
                        <button
                            className="main-btn"
                            onClick={startGame}
                            disabled={roomState.players.length < 2}
                        >
                            ゲーム開始
                        </button>
                    </>
                ) : (
                    <p className="instruction-text">オーナーがゲームを開始するまでお待ちください...</p>
                )}
            </div>
        </div>
    );
}
