'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useMultiRoom } from '@/app/context/MultiRoomContext';
import PlayerAvatar from '@/app/components/PlayerAvatar';

export default function MultiInvestPage() {
    const { myPlayer, roomState, submitInvest, advancePhase, displayTimeLeft, error } =
        useMultiRoom();
    const [amounts, setAmounts] = useState<number[]>([]);

    // Initialize amounts when state loads
    useEffect(() => {
        if (roomState) {
            setAmounts(new Array(roomState.players.length).fill(0));
        }
    }, [roomState?.players.length]);

    // Auto-advance when timer runs out
    useEffect(() => {
        if (displayTimeLeft === 0 && roomState?.phase === 'invest') {
            advancePhase('invest');
        }
    }, [displayTimeLeft]);

    if (!roomState || !myPlayer) {
        return (
            <div className="container">
                <div className="screen active">
                    <p>読み込み中...</p>
                </div>
            </div>
        );
    }

    const maxPerInvest = roomState.curR * 3;
    const totalSpending = amounts.reduce((sum, amt, idx) => {
        return idx !== myPlayer.turnOrder ? sum + (amt || 0) : sum;
    }, 0);
    const canSubmit = totalSpending <= myPlayer.sc;

    const setAmount = (idx: number, val: number) => {
        const newAmounts = [...amounts];
        newAmounts[idx] = Math.max(0, Math.min(val, maxPerInvest));
        setAmounts(newAmounts);
    };

    const waitingPlayers = roomState.players.filter(p => !p.investDone);

    if (myPlayer.investDone) {
        return (
            <div className="container">
                <div className="screen active">
                    <h2>投資タイム</h2>
                    <p style={{ color: '#6bcb77', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px' }}>
                        ✓ 投資を送信しました
                    </p>
                    <div className="info-card" style={{ marginTop: '8px' }}>
                        <div className="card-label" style={{ marginBottom: '12px' }}>投資待ち</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
                            {waitingPlayers.map(p => (
                                <PlayerAvatar
                                    key={p.id}
                                    name={p.name}
                                    turnOrder={p.turnOrder}
                                    size={52}
                                    badge="⏳"
                                />
                            ))}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #aaa)', marginTop: '12px', textAlign: 'center' }}>
                            残り {displayTimeLeft}秒 で自動的に次へ進みます
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="screen active">
                <h2>投資タイム</h2>

                {/* 自分 → 相手 アバター一覧（投資タイム直下） */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <PlayerAvatar
                        name={myPlayer.name}
                        turnOrder={myPlayer.turnOrder}
                        size={78}
                        isMe
                    />
                    <span style={{ fontSize: '1.2rem', color: 'var(--gold, #f0c040)' }}>→</span>
                    {roomState.players.filter((_, idx) => idx !== myPlayer.turnOrder).map(p => (
                        <PlayerAvatar
                            key={p.id}
                            name={p.name}
                            turnOrder={p.turnOrder}
                            size={52}
                        />
                    ))}
                </div>

                <div
                    className="info-card"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <div>
                        <div className="card-label">あなたの所持金</div>
                        <div className="card-value highlight-amount">
                            {myPlayer.sc}{' '}
                            <Image src="/coin.png" alt="coin" width={20} height={20} className="coin-icon-inline" />
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div className="card-label">残り時間</div>
                        <div
                            style={{
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                color: displayTimeLeft <= 10 ? '#ff6b6b' : 'var(--gold, #f0c040)',
                            }}
                        >
                            {displayTimeLeft}s
                        </div>
                    </div>
                </div>

                <p className="instruction-text">
                    1人あたりの上限: {maxPerInvest}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
                    {roomState.players.map((p, idx) => {
                        if (idx === myPlayer.turnOrder) return null; // skip self
                        return (
                            <div
                                key={p.id}
                                className="info-card"
                                style={{ padding: '14px 12px' }}
                            >
                                {/* 投資額入力 */}
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <div className="input-with-controls">
                                        <button
                                            className="control-btn"
                                            onClick={() => setAmount(idx, (amounts[idx] || 0) - 1)}
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={amounts[idx] || 0}
                                            onChange={e =>
                                                setAmount(idx, parseInt(e.target.value) || 0)
                                            }
                                            min="0"
                                            max={maxPerInvest}
                                            className="invest-input"
                                            style={{ width: '56px' }}
                                        />
                                        <button
                                            className="control-btn"
                                            onClick={() => setAmount(idx, (amounts[idx] || 0) + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="info-card" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>合計支出:</span>
                        <span
                            style={{
                                fontWeight: 'bold',
                                color: !canSubmit ? '#ff6b6b' : 'inherit',
                            }}
                        >
                            {totalSpending} / {myPlayer.sc}
                            <Image
                                src="/coin.png"
                                alt="coin"
                                width={16}
                                height={16}
                                className="coin-icon-inline"
                                style={{ marginLeft: '4px' }}
                            />
                        </span>
                    </div>
                </div>

                {!canSubmit && (
                    <p style={{ color: '#ff6b6b', marginBottom: '8px' }}>
                        所持金が足りません
                    </p>
                )}
                {error && <p style={{ color: '#ff6b6b', marginBottom: '8px' }}>{error}</p>}

                <button
                    className="main-btn"
                    onClick={() => submitInvest(amounts)}
                    disabled={!canSubmit}
                >
                    投資を確定
                </button>
            </div>
        </div>
    );
}
