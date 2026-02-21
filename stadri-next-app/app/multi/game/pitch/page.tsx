'use client';

import { useMultiRoom } from '@/app/context/MultiRoomContext';

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

                {/* Progress indicators */}
                <div
                    style={{
                        display: 'flex',
                        gap: '8px',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        flexWrap: 'wrap',
                    }}
                >
                    {roomState.players.map((p, i) => (
                        <div
                            key={p.id}
                            style={{
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                background:
                                    i < roomState.pIdx
                                        ? '#6bcb77'
                                        : i === roomState.pIdx
                                        ? 'var(--gold, #f0c040)'
                                        : 'rgba(255,255,255,0.1)',
                                color: i === roomState.pIdx ? '#000' : '#fff',
                                fontWeight: i === roomState.pIdx ? 'bold' : 'normal',
                            }}
                        >
                            {p.name}
                        </div>
                    ))}
                </div>

                <div
                    className="info-card presenter-card"
                    style={{
                        border: isPresenter
                            ? '3px solid var(--gold, #f0c040)'
                            : undefined,
                    }}
                >
                    <div className="card-label">発表者</div>
                    <div className="card-value">
                        {presenter?.name}
                        {isPresenter && ' 🎤 (あなた)'}
                    </div>
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
