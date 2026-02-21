'use client';

import { useMultiRoom } from '@/app/context/MultiRoomContext';
import PlayerAvatar from '@/app/components/PlayerAvatar';
import type { AvatarStatus } from '@/app/components/PlayerAvatar';

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function MultiPitchPage() {
    const { myPlayer, roomState, pitchAction, displayTimeLeft, error } = useMultiRoom();

    if (!roomState || !myPlayer) {
        return (
            <div className="container">
                <div className="screen active">
                    <p>読み込み中...</p>
                </div>
            </div>
        );
    }

    const presenter = roomState.players[roomState.pIdx];
    const presenterOdai = presenter?.odai;
    const isPresenter = presenter?.id === myPlayer.id;
    const isActive = roomState.timerActive;
    const totalPlayers = roomState.players.length;

    return (
        <div className="container">
            <div className="screen active">
                <h2>プレゼンタイム</h2>

                {/* 発表順プログレス：アミコン慣れ親しみ */}
                <div
                    style={{
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        flexWrap: 'wrap',
                    }}
                >
                    {roomState.players.map((p, i) => {
                        const st: AvatarStatus =
                            i < roomState.pIdx
                                ? 'done'
                                : i === roomState.pIdx
                                ? 'current'
                                : 'pending';
                        return (
                            <PlayerAvatar
                                key={p.id}
                                name={p.name}
                                turnOrder={p.turnOrder}
                                size={st === 'current' ? 72 : 48}
                                isMe={p.id === myPlayer.id && st === 'current'}
                                status={st}
                            />
                        );
                    })}
                </div>

                {/* Show odai only to presenter */}
                {isPresenter && presenterOdai && (
                    <div className="odai-display">
                        <div className="odai-label">お題</div>
                        <div className="odai-content">{presenterOdai.prob}</div>
                    </div>
                )}

                {/* Timer */}
                <div className="timer-controls">
                    {isPresenter && (
                        <button
                            className="timer-adjust-btn"
                            onClick={() => pitchAction('adjust', -30)}
                        >
                            -30s
                        </button>
                    )}
                    <div className="timer-display">{formatTime(displayTimeLeft)}</div>
                    {isPresenter && (
                        <button
                            className="timer-adjust-btn"
                            onClick={() => pitchAction('adjust', 30)}
                        >
                            +30s
                        </button>
                    )}
                </div>

                {isPresenter ? (
                    <div className="btn-group" style={{ flexDirection: 'column', gap: '10px' }}>
                        <button
                            className="main-btn timer-toggle"
                            onClick={() => pitchAction(isActive ? 'stop' : 'start')}
                        >
                            {isActive ? '発表終了（一時停止）' : '発表スタート'}
                        </button>
                        <button
                            className="main-btn accent-btn"
                            onClick={() => pitchAction('next')}
                        >
                            {roomState.pIdx < totalPlayers - 1 ? '次の人へ' : '投資タイムへ'}
                        </button>
                    </div>
                ) : (
                    <p className="instruction-text">
                        {presenter?.name} さんの発表を聞きましょう 👂
                    </p>
                )}

                {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
            </div>
        </div>
    );
}
