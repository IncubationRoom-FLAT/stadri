import { NextRequest, NextResponse } from 'next/server';
import { updateRoomInTransaction } from '@/lib/roomUtils';
import { assignOdai, GACHA_RESULTS } from '@/lib/gameData';
import type { MultiRoomState, InvLogEntry } from '@/lib/types';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { playerId, isSuccess } = await request.json();

        const result = await updateRoomInTransaction(id, (state) => {
            if (state.phase !== 'gacha') return { state };

            const player = state.players.find(p => p.id === playerId);
            if (!player) throw new Error('プレイヤーが見つかりません');
            if (player.gachaDone) return { state }; // already rolled

            const pIdx = player.turnOrder;
            const totalInvest = state.invests[pIdx] || 0;
            const mode = player.mode;
            const resultKey = isSuccess ? 'success' : 'fail';
            const multipliers = GACHA_RESULTS[mode as keyof typeof GACHA_RESULTS][resultKey as keyof typeof GACHA_RESULTS.Low];
            const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
            const gain = Math.round(totalInvest * multiplier);

            // Build log entry
            const logEntry: InvLogEntry = {
                round: state.curR,
                presenterName: player.name,
                totalInvest,
                mode,
                isSuccess,
                gain,
                investors: state.players
                    .filter(p => p.id !== playerId && p.investments[pIdx] > 0)
                    .map(p => ({
                        name: p.name,
                        amount: p.investments[pIdx],
                        bonus: isSuccess ? Math.round(p.investments[pIdx] * 0.5) : 0,
                    })),
            };

            let newPlayers = state.players.map(p => ({ ...p }));

            // Apply financial outcomes
            const pPlayerIdx = newPlayers.findIndex(p => p.id === playerId);
            if (isSuccess) {
                newPlayers[pPlayerIdx].sc += gain;
                // Bonus to investors
                newPlayers.forEach((p, idx) => {
                    if (p.id !== playerId) {
                        const invested = p.investments[pIdx] || 0;
                        if (invested > 0) {
                            newPlayers[idx].sc += Math.round(invested * 0.5);
                        }
                    }
                });
            } else {
                newPlayers[pPlayerIdx].debt += Math.abs(gain);
            }

            newPlayers[pPlayerIdx].gachaDone = true;
            newPlayers[pPlayerIdx].gachaResult = { isSuccess, gain };

            const allGachaDone = newPlayers.every(p => p.gachaDone);

            const newState: MultiRoomState = {
                ...state,
                players: newPlayers,
                invLog: [...state.invLog, logEntry],
            };

            if (allGachaDone) {
                if (state.curR < 3) {
                    // Next round: assign new odai, reset state
                    const newOdais = assignOdai(state.players.length);
                    return {
                        state: {
                            ...newState,
                            phase: 'confirm',
                            curR: state.curR + 1,
                            pIdx: 0,
                            players: newPlayers.map((p, i) => ({
                                ...p,
                                odai: newOdais[i],
                                odaiConfirmed: false,
                                gachaDone: false,
                                gachaResult: null,
                                investDone: false,
                                investments: [],
                                mode: 'Low',
                            })),
                            invests: new Array(state.players.length).fill(0),
                            phaseStartAt: new Date().toISOString(),
                            phaseTimeLimitSeconds: 30,
                        },
                    };
                } else {
                    // Game over: calculate final ranking
                    const finalRanking = newPlayers
                        .map(p => ({ name: p.name, score: p.sc - p.debt }))
                        .sort((a, b) => b.score - a.score);
                    return {
                        state: {
                            ...newState,
                            phase: 'rank',
                            finalRanking,
                        },
                    };
                }
            }

            return { state: newState };
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
