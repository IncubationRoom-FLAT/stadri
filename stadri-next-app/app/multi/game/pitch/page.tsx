'use client';

import { useMultiRoom } from '@/app/context/MultiRoomContext';
import PlayerAvatar from '@/app/components/PlayerAvatar';
import type { AvatarStatus } from '@/app/components/PlayerAvatar';
import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';

const STAMP_COUNT = 15;
const STAMP_FLOAT_DURATION_MS = 3000;

interface FloatingStamp {
    key: string;
    stampId: number;
    left: number; // percentage
    startY: number; // px from bottom
}

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ---- Floating stamp display for presenter ----
function StampOverlay({ floatingStamps }: { floatingStamps: FloatingStamp[] }) {
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 100,
                overflow: 'hidden',
            }}
        >
            {floatingStamps.map(fs => (
                <div
                    key={fs.key}
                    style={{
                        position: 'absolute',
                        bottom: `${fs.startY}px`,
                        left: `${fs.left}%`,
                        transform: 'translateX(-50%)',
                        animation: `stampFloat ${STAMP_FLOAT_DURATION_MS}ms ease-out forwards`,
                        width: 72,
                        height: 72,
                    }}
                >
                    <Image
                        src={`/reaction_stamps/${fs.stampId}.png`}
                        alt={`stamp ${fs.stampId}`}
                        width={72}
                        height={72}
                        style={{ objectFit: 'contain' }}
                    />
                </div>
            ))}
        </div>
    );
}

// ---- Stamp panel for non-presenters ----
function StampPanel({
    canSend,
    onSend,
}: {
    canSend: boolean;
    onSend: (stampId: number) => void;
}) {
    return (
        <div style={{ marginTop: '16px' }}>
            <p
                style={{
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    color: canSend ? '#aaa' : '#555',
                    marginBottom: '8px',
                }}
            >
                {canSend ? 'スタンプを送ろう！' : '発表が始まったらスタンプを送れます'}
            </p>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '8px',
                    maxWidth: '320px',
                    margin: '0 auto',
                }}
            >
                {Array.from({ length: STAMP_COUNT }, (_, i) => i + 1).map(id => (
                    <button
                        key={id}
                        disabled={!canSend}
                        onClick={() => onSend(id)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: canSend ? 'pointer' : 'not-allowed',
                            padding: '4px',
                            borderRadius: '8px',
                            opacity: canSend ? 1 : 0.35,
                            transition: 'transform 0.1s',
                        }}
                        onMouseDown={e => {
                            if (canSend) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.88)';
                        }}
                        onMouseUp={e => {
                            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                        }}
                    >
                        <Image
                            src={`/reaction_stamps/${id}.png`}
                            alt={`stamp ${id}`}
                            width={48}
                            height={48}
                            style={{ objectFit: 'contain', display: 'block' }}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function MultiPitchPage() {
    const { myPlayer, roomState, pitchAction, displayTimeLeft, error, sendStamp, stamps } =
        useMultiRoom();

    // Track which stamp EIDs have already been animated
    const seenEidsRef = useRef<Set<string>>(new Set());
    const [floatingStamps, setFloatingStamps] = useState<FloatingStamp[]>([]);

    // Reset seen EIDs when presenter changes (pIdx changes) so stamps from previous presenter don't reappear
    const prevPIdxRef = useRef<number | null>(null);
    useEffect(() => {
        if (!roomState) return;
        if (prevPIdxRef.current !== null && prevPIdxRef.current !== roomState.pIdx) {
            seenEidsRef.current = new Set();
            setFloatingStamps([]);
        }
        prevPIdxRef.current = roomState.pIdx;
    }, [roomState?.pIdx]);

    // Add new stamps to the floating animation queue
    useEffect(() => {
        if (!stamps || stamps.length === 0) return;
        const newEntries = stamps.filter(s => !seenEidsRef.current.has(s.eid));
        if (newEntries.length === 0) return;

        newEntries.forEach(s => seenEidsRef.current.add(s.eid));

        const newFloating: FloatingStamp[] = newEntries.map(s => ({
            key: s.eid,
            stampId: s.stampId,
            left: 10 + Math.random() * 80, // 10%–90% horizontal
            startY: 80 + Math.random() * 60, // 80–140px from bottom
        }));

        setFloatingStamps(prev => [...prev, ...newFloating]);

        // Remove after animation completes
        setTimeout(() => {
            const keys = new Set(newFloating.map(f => f.key));
            setFloatingStamps(prev => prev.filter(f => !keys.has(f.key)));
        }, STAMP_FLOAT_DURATION_MS + 100);
    }, [stamps]);

    const handleSendStamp = useCallback(
        async (stampId: number) => {
            try {
                await sendStamp(stampId);
            } catch {
                // silently ignore (e.g. spam protection)
            }
        },
        [sendStamp]
    );

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
        <>
            {/* CSS animation keyframes injected as a style tag */}
            <style>{`
                @keyframes stampFloat {
                    0%   { opacity: 0;   transform: translateX(-50%) translateY(0)   scale(0.6); }
                    15%  { opacity: 1;   transform: translateX(-50%) translateY(-20px) scale(1.15); }
                    80%  { opacity: 0.9; transform: translateX(-50%) translateY(-160px) scale(1); }
                    100% { opacity: 0;   transform: translateX(-50%) translateY(-220px) scale(0.8); }
                }
            `}</style>

            {/* Floating stamps overlay (visible to everyone, meaningful to presenter) */}
            {isPresenter && <StampOverlay floatingStamps={floatingStamps} />}

            <div className="container">
                <div className="screen active">
                    <h2>プレゼンタイム</h2>

                    {/* 発表順プログレス */}
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
                        <>
                            <p className="instruction-text">
                                {presenter?.name} さんの発表を聞きましょう 👂
                            </p>
                            <StampPanel canSend={isActive} onSend={handleSendStamp} />
                        </>
                    )}

                    {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
                </div>
            </div>
        </>
    );
}
