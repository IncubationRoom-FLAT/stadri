import { NextRequest, NextResponse } from 'next/server';
import { updateRoomInTransaction, calcTimerTimeLeft } from '@/lib/roomUtils';

/**
 * Actions:
 * - 'start': Start the pitch timer
 * - 'stop':  Stop the pitch timer
 * - 'adjust': Adjust timeLeft by `amount` seconds
 * - 'next': Move to next presenter (or advance to invest)
 * - 'proceed': Owner advances from thinking to pitch
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { playerId, action, amount } = await request.json();

        const result = await updateRoomInTransaction(id, (state) => {
            const player = state.players.find(p => p.id === playerId);
            if (!player) throw new Error('プレイヤーが見つかりません');

            const now = new Date().toISOString();

            if (action === 'proceed') {
                // Owner advances thinking → pitch
                if (state.phase !== 'thinking') return { state };
                if (!player.isOwner) throw new Error('オーナーのみが操作できます');
                return {
                    state: {
                        ...state,
                        phase: 'pitch' as const,
                        pIdx: 0,
                        timerActive: false,
                        timeLeft: 180,
                        timerLastUpdatedAt: now,
                        phaseStartAt: now,
                        phaseTimeLimitSeconds: null,
                    },
                };
            }

            if (state.phase !== 'thinking' && state.phase !== 'pitch') return { state };

            // Only presenter (or owner for thinking) can control timer
            const isPresenter = state.phase === 'pitch'
                ? state.players[state.pIdx]?.id === playerId
                : player.isOwner;

            if (!isPresenter && action !== 'next') {
                throw new Error('この操作は発表者のみが実行できます');
            }

            if (action === 'start') {
                return {
                    state: {
                        ...state,
                        timerActive: true,
                        timerLastUpdatedAt: now,
                    },
                };
            }

            if (action === 'stop') {
                const currentTimeLeft = calcTimerTimeLeft(state);
                return {
                    state: {
                        ...state,
                        timerActive: false,
                        timeLeft: Math.round(currentTimeLeft),
                        timerLastUpdatedAt: now,
                    },
                };
            }

            if (action === 'adjust') {
                const currentTimeLeft = calcTimerTimeLeft(state);
                let newTime = Math.round(currentTimeLeft) + (amount || 0);
                newTime = Math.max(0, Math.min(600, newTime));
                return {
                    state: {
                        ...state,
                        timerActive: false,
                        timeLeft: newTime,
                        timerLastUpdatedAt: now,
                    },
                };
            }

            if (action === 'next') {
                if (!isPresenter) throw new Error('この操作は発表者のみが実行できます');
                const nextPIdx = state.pIdx + 1;
                if (nextPIdx < state.players.length) {
                    return {
                        state: {
                            ...state,
                            pIdx: nextPIdx,
                            timerActive: false,
                            timeLeft: 180,
                            timerLastUpdatedAt: now,
                        },
                    };
                } else {
                    // All pitches done → invest
                    const investTimeSec = state.players.length * 30;
                    return {
                        state: {
                            ...state,
                            phase: 'invest' as const,
                            pIdx: 0,
                            timerActive: false,
                            timeLeft: 0,
                            timerLastUpdatedAt: now,
                            phaseStartAt: now,
                            phaseTimeLimitSeconds: investTimeSec,
                            players: state.players.map(p => ({
                                ...p,
                                investDone: false,
                                investments: new Array(state.players.length).fill(0),
                            })),
                            invests: new Array(state.players.length).fill(0),
                        },
                    };
                }
            }

            return { state };
        });

        if (!result) {
            return NextResponse.json({ error: 'ルームが見つかりません' }, { status: 404 });
        }
        return NextResponse.json({ state: result.state });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'サーバーエラー' },
            { status: 500 }
        );
    }
}
