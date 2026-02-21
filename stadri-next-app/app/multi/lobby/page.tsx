'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMultiRoom } from '@/app/context/MultiRoomContext';
import PlayerAvatar from '@/app/components/PlayerAvatar';

function formatTime(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function LobbyPage() {
    const router = useRouter();
    const { roomId, roomState, myPlayer, startGame, endGame, displayTimeLeft, error } = useMultiRoom();

    // Redirect if no room
    useEffect(() => {
        if (!roomId) router.push('/');
    }, [roomId, router]);

    // オーナーのみ: タイムアウト時にルームを閉じる
    useEffect(() => {
        if (roomState?.phase === 'waiting' && displayTimeLeft === 0 && myPlayer?.isOwner) {
            endGame();
        }
    }, [displayTimeLeft, roomState?.phase, myPlayer?.isOwner]);

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

                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#aaa' }}>待機時間残り</span>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: displayTimeLeft <= 30 ? '#ff6b6b' : '#f0c040', letterSpacing: '2px' }}>
                        {formatTime(displayTimeLeft)}
                    </div>
                </div>

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
                            flexWrap: 'wrap',
                            gap: '16px',
                            justifyContent: 'center',
                            marginTop: '14px',
                        }}
                    >
                        {roomState.players.map(p => (
                            <PlayerAvatar
                                key={p.id}
                                name={p.name + (p.isOwner ? '\n(オーナー)' : '')}
                                turnOrder={p.turnOrder}
                                size={60}
                                isMe={p.id === myPlayer?.id}
                                badge={p.isOwner ? 'HOST' : undefined}
                            />
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
                        <button
                            style={{ marginTop: '12px', background: 'transparent', border: '1px solid #ff6b6b', color: '#ff6b6b', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', width: '100%' }}
                            onClick={endGame}
                        >
                            ルームを閉じる
                        </button>
                    </>
                ) : (
                    <p className="instruction-text">
                        オーナーがゲームを開始するまでお待ちください...<br />
                        <span style={{ fontSize: '0.85rem', color: '#aaa' }}>（残り {formatTime(displayTimeLeft)} で自動解散）</span>
                    </p>
                )}
            </div>
        </div>
    );
}
