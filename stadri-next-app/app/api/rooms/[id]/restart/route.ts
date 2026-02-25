import { NextRequest, NextResponse } from 'next/server';
import { updateRoomInTransaction } from '@/lib/roomUtils';
import { assignOdai } from '@/lib/gameData';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { playerId } = await request.json();

        const result = await updateRoomInTransaction(id, (state) => {
            const player = state.players.find(p => p.id === playerId);
            if (!player?.isOwner) {
                throw new Error('オーナーのみがゲームを再開できます');
            }
            if (state.phase !== 'rank') {
                throw new Error('ゲームが終了していません');
            }

            const newOdais = assignOdai(state.players.length);
            const resetPlayers = state.players.map((p, i) => ({
                ...p,
                sc: 10,
                debt: 0,
                odai: newOdais[i],
                odaiConfirmed: false,
                mode: 'Low' as const,
                gachaDone: false,
                gachaResult: null,
                investDone: false,
                investments: [],
            }));

            return {
                state: {
                    ...state,
                    phase: 'confirm' as const,
                    curR: 1,
                    pIdx: 0,
                    players: resetPlayers,
                    invests: new Array(state.players.length).fill(0),
                    invLog: [],
                    phaseStartAt: new Date().toISOString(),
                    phaseTimeLimitSeconds: 30,
                    timerActive: false,
                    timeLeft: 180,
                    timerLastUpdatedAt: null,
                    finalRanking: null,
                    stamps: [],
                },
            };
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
