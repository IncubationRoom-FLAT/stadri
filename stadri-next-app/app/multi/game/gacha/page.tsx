'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useMultiRoom } from '@/app/context/MultiRoomContext';

export default function MultiGachaPage() {
    const { myPlayer, roomState, submitGacha, error } = useMultiRoom();

    const needleRef = useRef<HTMLDivElement>(null);
    const [rocketImage, setRocketImage] = useState<string | null>(null);
    const [slotResults, setSlotResults] = useState<(string | null)[]>([null, null, null]);
    const [isRolling, setIsRolling] = useState(false);
    const [gachaResult, setGachaResult] = useState<{ isSuccess: boolean; gain: number } | null>(null);
    const [showResultPopup, setShowResultPopup] = useState(false);
    const [localSuccessRate, setLocalSuccessRate] = useState(0);

    useEffect(() => {
        if (!roomState || !myPlayer) return;
        const pIdx = myPlayer.turnOrder;
        const totalInvest = roomState.invests[pIdx] || 0;
        const mode = myPlayer.mode;
        const probMult = mode === 'High' ? 0.5 : 1.0;
        const rate = ((totalInvest + 0.1) / (totalInvest + 1.1)) * probMult;
        setLocalSuccessRate(rate);
    }, [roomState?.invests, myPlayer?.turnOrder, myPlayer?.mode]);

    if (!roomState || !myPlayer) {
        return (
            <div className="container">
                <div className="screen active">
                    <p>読み込み中...</p>
                </div>
            </div>
        );
    }

    const pIdx = myPlayer.turnOrder;
    const totalInvest = roomState.invests[pIdx] || 0;
    const waitingPlayers = roomState.players.filter(p => !p.gachaDone);

    // Already done: show waiting screen
    if (myPlayer.gachaDone) {
        return (
            <div className="container">
                <div className="screen active">
                    <h2>ガチャタイム</h2>
                    <p style={{ color: '#6bcb77', fontWeight: 'bold', textAlign: 'center' }}>
                        ✓ ガチャを完了しました
                    </p>
                    {myPlayer.gachaResult && (
                        <div className="info-card" style={{ marginTop: '16px', textAlign: 'center' }}>
                            <div
                                style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: myPlayer.gachaResult.isSuccess ? '#6bcb77' : '#ff6b6b',
                                }}
                            >
                                {myPlayer.gachaResult.isSuccess ? 'SUCCESS!!' : 'FAILURE...'}
                            </div>
                            <div style={{ marginTop: '8px' }}>
                                {myPlayer.gachaResult.isSuccess ? '獲得資金' : '負債額'}:{' '}
                                {Math.abs(myPlayer.gachaResult.gain)}
                                <Image src="/coin.png" alt="coin" width={18} height={18} className="coin-icon-inline" />
                            </div>
                        </div>
                    )}
                    <div className="info-card" style={{ marginTop: '16px' }}>
                        <div className="card-label">待機中</div>
                        {waitingPlayers.map(p => (
                            <p key={p.id} style={{ margin: '4px 0', color: 'var(--text-muted, #aaa)' }}>
                                ⏳ {p.name} さんのガチャを待っています
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const roll = () => {
        if (isRolling || gachaResult) return;
        setIsRolling(true);
        setGachaResult(null);
        setShowResultPopup(false);

        const mode = myPlayer.mode;
        const GACHA_RATES = { Low: { success: 0.7 }, High: { success: 0.4 } };
        const rate = GACHA_RATES[mode as keyof typeof GACHA_RATES];
        const randomValue = Math.random();
        const isSuccess = randomValue < rate.success;

        if (roomState.curR === 2) {
            performRouletteAnimation(isSuccess);
        } else if (roomState.curR === 3) {
            performRocketAnimation(isSuccess);
        } else {
            performSlotAnimation(isSuccess);
        }
    };

    const performRouletteAnimation = (isSuccess: boolean) => {
        let winCount = Math.round(localSuccessRate * 12);
        if (winCount === 0 && localSuccessRate > 0) winCount = 1;
        if (winCount === 12) winCount = 11;
        const spots = Array(12).fill(false);
        for (let i = 0; i < winCount; i++) spots[i] = true;
        spots.sort(() => Math.random() - 0.5);
        const matchingSpots = spots.map((win, idx) => ({ idx, win })).filter(s => s.win === isSuccess);
        const winningSpot = matchingSpots[Math.floor(Math.random() * matchingSpots.length)];
        if (needleRef.current) {
            const totalDeg = 3600 + winningSpot.idx * 30;
            needleRef.current.style.transition = 'none';
            needleRef.current.style.transform = 'rotate(0deg)';
            setTimeout(() => {
                if (needleRef.current) {
                    needleRef.current.style.transition = 'transform 5s cubic-bezier(0.15, 0, 0.15, 1)';
                    needleRef.current.style.transform = `rotate(${totalDeg}deg)`;
                }
                setTimeout(() => finalizeAndSubmit(isSuccess), 5500);
            }, 100);
        }
    };

    const performSlotAnimation = async (isSuccess: boolean) => {
        const URL_SUCCESS = '/image3.jpg';
        const URL_FAIL = '/image1.jpg';
        const targetSymbol = isSuccess ? URL_SUCCESS : URL_FAIL;
        for (let i = 0; i < 3; i++) {
            await new Promise<void>(resolve => {
                let spinCount = 0;
                const spinInterval = setInterval(() => {
                    const randomSymbol = Math.random() < localSuccessRate ? URL_SUCCESS : URL_FAIL;
                    setSlotResults(prev => {
                        const next = [...prev];
                        next[i] = randomSymbol;
                        return next;
                    });
                    spinCount++;
                    if (spinCount > 10) {
                        clearInterval(spinInterval);
                        setSlotResults(prev => {
                            const next = [...prev];
                            next[i] = targetSymbol;
                            return next;
                        });
                        setTimeout(resolve, 500);
                    }
                }, 100);
            });
        }
        setTimeout(() => finalizeAndSubmit(isSuccess), 1000);
    };

    const performRocketAnimation = async (isSuccess: boolean) => {
        setRocketImage('/success_rocket1.png');
        await new Promise(r => setTimeout(r, 800));
        setRocketImage('/success_rocket2.png');
        await new Promise(r => setTimeout(r, 800));
        await new Promise(r => setTimeout(r, 500));
        setRocketImage(isSuccess ? '/success_rocket3.png' : '/fail_rocket3.png');
        await new Promise(r => setTimeout(r, 800));
        setRocketImage(isSuccess ? '/success_rocket4.png' : '/fail_rocket4.png');
        await new Promise(r => setTimeout(r, 1000));
        finalizeAndSubmit(isSuccess);
    };

    const finalizeAndSubmit = async (isSuccess: boolean) => {
        // Optimistic local result display
        const GACHA_RESULTS = {
            Low: { success: [1.5, 1.2, 1] as number[], fail: [-0.5, -0.2] as number[] },
            High: { success: [3, 2, 1.5] as number[], fail: [-1, -0.5] as number[] },
        };
        const mode = myPlayer.mode as keyof typeof GACHA_RESULTS;
        const resultKey = isSuccess ? 'success' : 'fail';
        const multipliers = GACHA_RESULTS[mode][resultKey];
        const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
        const gain = Math.round(totalInvest * multiplier);
        const localResult = { isSuccess, gain };
        setGachaResult(localResult);
        setIsRolling(false);
        setShowResultPopup(true);

        // Submit to server
        await submitGacha(isSuccess);
    };

    return (
        <div className="container">
            <div className="screen active">
                <h2>ガチャタイム</h2>

                <div className="info-card presenter-card">
                    <div className="card-label">挑戦者</div>
                    <div className="card-value">{myPlayer.name} (あなた)</div>
                </div>

                <div className="info-card balance-card">
                    <div className="card-label">集めた資金額</div>
                    <div className="card-value highlight-amount">
                        {totalInvest}{' '}
                        <Image src="/coin.png" alt="coin" width={24} height={24} className="coin-icon" />
                    </div>
                </div>

                <div className="success-rate-bar">
                    <div className="rate-bar-fill" style={{ width: `${localSuccessRate * 100}%` }} />
                    <div className="rate-bar-label">
                        成功確率: {Math.round(localSuccessRate * 100)}%
                    </div>
                </div>

                <div className="mode-selector">
                    <button
                        className={`mode-btn ${myPlayer.mode === 'Low' ? 'active' : ''}`}
                        disabled={isRolling || !!gachaResult}
                    >
                        ローリスク
                    </button>
                    <button
                        className={`mode-btn ${myPlayer.mode === 'High' ? 'active' : ''}`}
                        disabled={isRolling || !!gachaResult}
                    >
                        ハイリスク
                    </button>
                </div>

                {/* Roulette (Round 2) */}
                {roomState.curR === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0' }}>
                        <div
                            style={{
                                width: 'min(350px, 90vw)',
                                height: 'min(350px, 90vw)',
                                borderRadius: '50%',
                                border: '10px solid var(--gold)',
                                position: 'relative',
                                background: 'radial-gradient(#fff, #f0f0f0)',
                                overflow: 'hidden',
                                boxShadow: '0 0 25px rgba(0,0,0,0.3)',
                            }}
                        >
                            {Array.from({ length: 12 }).map((_, i) => {
                                const isWin = i < Math.round(localSuccessRate * 12);
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            position: 'absolute',
                                            width: '100%',
                                            height: '100%',
                                            transform: `rotate(${i * 30}deg)`,
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Image
                                            src={isWin ? '/image3.jpg' : '/image1.jpg'}
                                            alt={isWin ? 'success' : 'fail'}
                                            width={60}
                                            height={60}
                                            style={{
                                                position: 'absolute',
                                                top: '20px',
                                                left: 'calc(50% - 30px)',
                                                transform: `rotate(-${i * 30}deg)`,
                                            }}
                                        />
                                    </div>
                                );
                            })}
                            <div
                                ref={needleRef}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 'calc(50% - 4px)',
                                    width: '8px',
                                    height: '50%',
                                    background: '#ff4d4d',
                                    transformOrigin: 'bottom',
                                    borderRadius: '10px',
                                    zIndex: 100,
                                }}
                            >
                                <div
                                    style={{
                                        width: 0,
                                        height: 0,
                                        borderLeft: '12px solid transparent',
                                        borderRight: '12px solid transparent',
                                        borderBottom: '24px solid #ff4d4d',
                                        position: 'absolute',
                                        top: '-20px',
                                        left: '-8px',
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    width: '30px',
                                    height: '30px',
                                    background: 'var(--gold)',
                                    borderRadius: '50%',
                                    transform: 'translate(-50%,-50%)',
                                    zIndex: 101,
                                    border: '3px solid #fff',
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Slot (Round 1) */}
                {roomState.curR !== 2 && roomState.curR !== 3 && (
                    <div className="slot-container">
                        {[0, 1, 2].map(i => (
                            <div
                                key={i}
                                className="slot-reel-window"
                                style={{
                                    width: 'min(140px, 28vw)',
                                    height: 'min(160px, 32vw)',
                                    overflow: 'hidden',
                                    background: '#fff',
                                    border: '5px solid var(--gold)',
                                    borderRadius: '10px',
                                }}
                            >
                                <div
                                    className="slot-char"
                                    style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    {slotResults[i] && (
                                        <Image
                                            src={slotResults[i]!}
                                            alt="slot"
                                            width={130}
                                            height={130}
                                            style={{ objectFit: 'contain', width: '90%', height: 'auto' }}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Rocket (Round 3) */}
                {roomState.curR === 3 && (
                    <div
                        className="rocket-container"
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                            margin: '40px 0',
                            minHeight: '400px',
                        }}
                    >
                        {rocketImage && (
                            <Image
                                src={rocketImage}
                                alt="rocket animation"
                                width={300}
                                height={400}
                                style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '400px' }}
                                priority
                            />
                        )}
                    </div>
                )}

                {!gachaResult && (
                    <button className="main-btn" onClick={roll} disabled={isRolling}>
                        {isRolling ? '抽選中...' : '運命の判定！'}
                    </button>
                )}

                {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}

                {/* Result Popup */}
                {showResultPopup && gachaResult && (
                    <div className="result-popup-overlay" onClick={() => setShowResultPopup(false)}>
                        <div className="result-popup" onClick={e => e.stopPropagation()}>
                            <div className={`result-popup-content ${gachaResult.isSuccess ? 'success' : 'failure'}`}>
                                <h2 className="result-title">
                                    {gachaResult.isSuccess ? 'SUCCESS!!' : 'FAILURE...'}
                                </h2>
                                <p className="result-amount">
                                    {gachaResult.isSuccess ? '獲得資金' : '負債額'}:{' '}
                                    <span className="amount-value">
                                        {Math.abs(gachaResult.gain)}{' '}
                                        <Image src="/coin.png" alt="coin" width={28} height={28} className="coin-icon" />
                                    </span>
                                </p>
                                <button className="popup-close-btn" onClick={() => setShowResultPopup(false)}>
                                    閉じる
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
