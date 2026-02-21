'use client';

import Image from 'next/image';
import { useMultiRoom } from '@/app/context/MultiRoomContext';

export default function MultiRankPage() {
    const { myPlayer, roomState, restartGame, endGame, error } = useMultiRoom();

    if (!roomState) {
        return (
            <div className="container">
                <div className="screen active">
                    <p>読み込み中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="screen active">
                <h2>🏆 最終結果</h2>

                <div className="ranking-container">
                    {roomState.finalRanking?.map((p, i) => (
                        <div
                            key={i}
                            className={`rank-card rank-${i + 1}`}
                            style={{
                                border:
                                    p.name === myPlayer?.name
                                        ? '2px solid var(--gold, #f0c040)'
                                        : undefined,
                            }}
                        >
                            <div className="rank-position">{i + 1}</div>
                            <div className="rank-info">
                                <div className="rank-name">
                                    {p.name}
                                    {p.name === myPlayer?.name && ' (あなた)'}
                                </div>
                                <div className="rank-score">
                                    {p.score}{' '}
                                    <Image
                                        src="/coin.png"
                                        alt="coin"
                                        width={24}
                                        height={24}
                                        className="coin-icon"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {error && <p style={{ color: '#ff6b6b', marginBottom: '8px' }}>{error}</p>}

                {myPlayer?.isOwner ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                        <button className="main-btn" onClick={restartGame}>
                            もう一度プレイ
                        </button>
                        <button className="main-btn accent-btn" onClick={endGame}>
                            終了（ルームを削除）
                        </button>
                    </div>
                ) : (
                    <p className="instruction-text" style={{ marginTop: '16px' }}>
                        オーナーがゲームの終了か再開を選択するまでお待ちください...
                    </p>
                )}
            </div>
        </div>
    );
}
