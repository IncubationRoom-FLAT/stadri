'use client';

import { useMultiRoom } from '@/app/context/MultiRoomContext';

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function MultiThinkingPage() {
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

    const isOwner = myPlayer.isOwner;
    const isActive = roomState.timerActive;

    return (
        <div className="container">
            <div className="screen active">
                <h2 className="thinking-title">💡 Thinking Time</h2>

                <p className="instruction-text">
                    {isOwner
                        ? 'みんなが考える時間です。タイマーをスタートしてください。'
                        : 'オーナーがタイマーをコントロールしています。考える時間を使いましょう。'}
                </p>

                <div className="timer-controls">
                    {isOwner && (
                        <button
                            className="timer-adjust-btn"
                            onClick={() => pitchAction('adjust', -30)}
                        >
                            -30s
                        </button>
                    )}
                    <div id="think-timer" className="timer-display">
                        {formatTime(displayTimeLeft)}
                    </div>
                    {isOwner && (
                        <button
                            className="timer-adjust-btn"
                            onClick={() => pitchAction('adjust', 30)}
                        >
                            +30s
                        </button>
                    )}
                </div>

                {isOwner ? (
                    <>
                        <button
                            id="timer-toggle-btn"
                            className="main-btn timer-toggle"
                            onClick={() => pitchAction(isActive ? 'stop' : 'start')}
                        >
                            {isActive ? 'ストップ' : 'スタート'}
                        </button>
                        <button
                            className="next-btn accent-btn"
                            onClick={() => pitchAction('proceed')}
                        >
                            プレゼンを開始する
                        </button>
                    </>
                ) : (
                    <p className="instruction-text" style={{ marginTop: '24px' }}>
                        オーナーがプレゼンを開始するまでお待ちください...
                    </p>
                )}

                {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
            </div>
        </div>
    );
}
