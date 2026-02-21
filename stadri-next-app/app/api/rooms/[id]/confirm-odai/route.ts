import { NextRequest, NextResponse } from 'next/server';
import { updateRoomInTransaction } from '@/lib/roomUtils';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { playerId } = await request.json();

        const result = await updateRoomInTransaction(id, (state) => {
            if (state.phase !== 'confirm') {
                return { state };
            }
            const updatedPlayers = state.players.map(p =>
                p.id === playerId ? { ...p, odaiConfirmed: true } : p
            );
            const allConfirmed = updatedPlayers.every(p => p.odaiConfirmed);

            const newState = {
                ...state,
                players: updatedPlayers,
                ...(allConfirmed && {
                    phase: 'thinking' as const,
                    phaseStartAt: new Date().toISOString(),
                    phaseTimeLimitSeconds: null,
                    timerActive: false,
                    timeLeft: 180,
                    timerLastUpdatedAt: null,
                }),
            };
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
