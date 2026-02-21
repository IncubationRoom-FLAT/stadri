'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMultiRoom } from '@/app/context/MultiRoomContext';

export default function JoinRoomPage() {
    const router = useRouter();
    const { initSession } = useMultiRoom();
    const [roomId, setRoomId] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleJoin = async () => {
        if (roomId.trim().length < 1) {
            setError('ルームIDを入力してください');
            return;
        }
        if (playerName.trim().length < 1) {
            setError('プレイヤー名を入力してください');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/rooms/${encodeURIComponent(roomId.trim())}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerName: playerName.trim() }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'エラーが発生しました');
                return;
            }
            initSession(roomId.trim(), data.playerId);
            router.push('/multi/lobby');
        } catch {
            setError('サーバーに接続できませんでした');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="screen active">
                <h2>ルームに参加</h2>

                <div className="setup-section">
                    <h3>あなたの名前</h3>
                    <div className="name-input-wrapper">
                        <input
                            type="text"
                            className="name-input"
                            value={playerName}
                            onChange={e => setPlayerName(e.target.value)}
                            placeholder="プレイヤー名"
                            maxLength={20}
                        />
                    </div>
                </div>

                <div className="setup-section">
                    <h3>ルームID</h3>
                    <div className="name-input-wrapper">
                        <input
                            type="text"
                            className="name-input"
                            value={roomId}
                            onChange={e => setRoomId(e.target.value)}
                            placeholder="オーナーに確認したルームID"
                            maxLength={30}
                        />
                    </div>
                </div>

                {error && (
                    <p style={{ color: '#ff6b6b', marginBottom: '12px' }}>{error}</p>
                )}

                <button className="main-btn" onClick={handleJoin} disabled={loading}>
                    {loading ? '参加中...' : 'ルームに参加'}
                </button>
                <button className="main-btn accent-btn" onClick={() => router.back()}>
                    戻る
                </button>
            </div>
        </div>
    );
}
