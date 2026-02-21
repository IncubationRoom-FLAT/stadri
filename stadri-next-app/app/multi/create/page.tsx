'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMultiRoom } from '@/app/context/MultiRoomContext';

export default function EnterRoomPage() {
    const router = useRouter();
    const { initSession } = useMultiRoom();
    const [roomId, setRoomId] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleEnter = async () => {
        const trimId = roomId.trim();
        const trimName = playerName.trim();
        if (trimId.length < 3) {
            setError('ルームIDは3文字以上で入力してください');
            return;
        }
        if (trimName.length < 1) {
            setError('プレイヤー名を入力してください');
            return;
        }
        setLoading(true);
        setError('');
        try {
            // まず作成を試みる
            const createRes = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId: trimId, playerName: trimName }),
            });
            if (createRes.ok) {
                // 新規作成成功 → オーナーとしてロビーへ
                const data = await createRes.json();
                initSession(data.roomId, data.playerId);
                router.push('/multi/lobby');
                return;
            }
            const createData = await createRes.json();
            if (createRes.status === 409) {
                // ルームが既に存在する → 参加を試みる
                const joinRes = await fetch(`/api/rooms/${encodeURIComponent(trimId)}/join`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ playerName: trimName }),
                });
                const joinData = await joinRes.json();
                if (!joinRes.ok) {
                    setError(joinData.error || '参加できませんでした');
                    return;
                }
                initSession(trimId, joinData.playerId);
                router.push('/multi/lobby');
                return;
            }
            setError(createData.error || 'エラーが発生しました');
        } catch {
            setError('サーバーに接続できませんでした');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="screen active">
                <h2>複数端末でプレイ</h2>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted, #aaa)', marginBottom: '16px', lineHeight: 1.6 }}>
                    ルームIDを入力してください。<br />
                    存在しないIDは新規作成、既存IDは参加します。
                </p>

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
                            onKeyDown={e => e.key === 'Enter' && handleEnter()}
                        />
                    </div>
                </div>

                {error && (
                    <p style={{ color: '#ff6b6b', marginBottom: '12px' }}>{error}</p>
                )}

                <button className="main-btn" onClick={handleEnter} disabled={loading}>
                    {loading ? '接続中...' : '入室する'}
                </button>
                <button className="main-btn accent-btn" onClick={() => router.back()}>
                    戻る
                </button>
            </div>
        </div>
    );
}
