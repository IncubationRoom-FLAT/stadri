'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMultiRoom } from '@/app/context/MultiRoomContext';

export default function CreateRoomPage() {
    const router = useRouter();
    const { initSession } = useMultiRoom();
    const [roomId, setRoomId] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async () => {
        if (roomId.trim().length < 3) {
            setError('ルームIDは3文字以上で入力してください');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: roomId.trim(),
                    playerName: playerName.trim() || 'オーナー',
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'エラーが発生しました');
                return;
            }
            initSession(data.roomId, data.playerId);
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
                <h2>ルームを作成</h2>

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
                    <h3>ルームID（3文字以上）</h3>
                    <div className="name-input-wrapper">
                        <input
                            type="text"
                            className="name-input"
                            value={roomId}
                            onChange={e => setRoomId(e.target.value)}
                            placeholder="例：スタートアップ"
                            maxLength={30}
                        />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #aaa)', marginTop: '6px' }}>
                        ※ 参加者が入力するIDです。ゲーム終了後に削除されます。
                    </p>
                </div>

                {error && (
                    <p style={{ color: '#ff6b6b', marginBottom: '12px' }}>{error}</p>
                )}

                <button className="main-btn" onClick={handleCreate} disabled={loading}>
                    {loading ? '作成中...' : 'ルームを作成'}
                </button>
                <button className="main-btn accent-btn" onClick={() => router.back()}>
                    戻る
                </button>
            </div>
        </div>
    );
}
