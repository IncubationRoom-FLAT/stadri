import { NextRequest, NextResponse } from 'next/server';
import { updateRoomInTransaction } from '@/lib/roomUtils';
import type { MultiRoomState } from '@/lib/types';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { playerId, investments } = await request.json();
        // investments: number[] indexed by target turnOrder

        const result = await updateRoomInTransaction(id, (state) => {
            if (state.phase !== 'invest') {
                return { state };
            }
            const player = state.players.find(p => p.id === playerId);
            if (!player) throw new Error('プレイヤーが見つかりません');
            if (player.investDone) return { state }; // already submitted

            // Validate amounts
            const maxPerInvest = state.curR * 3;
            const investArr = investments as number[];
            const totalInvesting = investArr.reduce((sum, amt, idx) => {
                return idx !== player.turnOrder ? sum + (amt || 0) : sum;
            }, 0);
            if (totalInvesting > player.sc) {
                throw new Error('所持金が足りません');
            }
            investArr.forEach((amt, idx) => {
                if (idx !== player.turnOrder && amt > maxPerInvest) {
                    throw new Error(`1人への投資上限は${maxPerInvest}コインです`);
                }
            });

            const updatedPlayers = state.players.map(p =>
                p.id === playerId
                    ? { ...p, investDone: true, investments: investArr }
                    : p
            );
            const allDone = updatedPlayers.every(p => p.investDone);

            if (allDone) {
                const newState = applyInvestmentsAndMoveToGacha({
                    ...state,
                    players: updatedPlayers,
                });
                return { state: newState };
            }

            return { state: { ...state, players: updatedPlayers } };
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
    const newInvests = new Array(state.players.length).fill(0);
    const newPlayers = state.players.map(p => ({ ...p }));

    state.players.forEach((investor) => {
        if (!investor.investDone) return;
        investor.investments.forEach((amount, targetIdx) => {
            if (targetIdx !== investor.turnOrder && amount > 0) {
                newInvests[targetIdx] += amount;
                const iIdx = newPlayers.findIndex(p => p.id === investor.id);
                if (iIdx >= 0) newPlayers[iIdx].sc -= amount;
            }
        });
    });

    return {
        ...state,
        phase: 'gacha',
        players: newPlayers.map(p => ({ ...p, gachaDone: false, gachaResult: null })),
        invests: newInvests,
        pIdx: 0,
        phaseStartAt: new Date().toISOString(),
        phaseTimeLimitSeconds: null,
    };
}
