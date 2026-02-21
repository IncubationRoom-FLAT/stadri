import { NextRequest, NextResponse } from 'next/server';
import { updateRoomInTransaction } from '@/lib/roomUtils';
import type { MultiRoomState } from '@/lib/types';

/**
 * Called when a phase timer expires or all players complete an action.
 * Handles confirm → thinking, invest → gacha transitions.
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { fromPhase } = await request.json();

        const result = await updateRoomInTransaction(id, (state) => {
            // Only advance if still in expected phase (idempotent)
            if (state.phase !== fromPhase) {
                return { state };
            }

            if (fromPhase === 'confirm') {
                return {
                    state: {
                        ...state,
                        phase: 'thinking' as const,
                        phaseStartAt: new Date().toISOString(),
                        phaseTimeLimitSeconds: null,
                        timerActive: false,
                        timeLeft: 180,
                        timerLastUpdatedAt: null,
                    },
                };
            }

            if (fromPhase === 'invest') {
                // Apply accumulated investments, then move to gacha
                const newState = applyInvestmentsAndMoveToGacha(state);
                return { state: newState };
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

function applyInvestmentsAndMoveToGacha(state: MultiRoomState): MultiRoomState {
    // Calculate total investment received per player
    const newInvests = new Array(state.players.length).fill(0);
    const newPlayers = state.players.map(p => ({ ...p }));

    state.players.forEach((investor, iIdx) => {
        if (!investor.investDone) return;
        investor.investments.forEach((amount, targetIdx) => {
            if (targetIdx !== iIdx && amount > 0) {
                newInvests[targetIdx] += amount;
                newPlayers[iIdx].sc -= amount;
            }
        });
    });

    return {
        ...state,
        phase: 'gacha',
        players: newPlayers.map(p => ({ ...p, gachaDone: false })),
        invests: newInvests,
        pIdx: 0,
        phaseStartAt: new Date().toISOString(),
        phaseTimeLimitSeconds: null,
    };
}
