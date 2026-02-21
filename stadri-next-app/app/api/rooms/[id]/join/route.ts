import { NextRequest, NextResponse } from 'next/server';
import { updateRoomInTransaction } from '@/lib/roomUtils';
import type { MultiPlayer } from '@/lib/types';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { playerName } = await request.json();
        const playerId = crypto.randomUUID();

        const result = await updateRoomInTransaction(id, (state) => {
            if (state.phase !== 'waiting') {
                throw new Error('このゲームはすでに開始されています');
            }
            const turnOrder = state.players.length;
            const newPlayer: MultiPlayer = {
                id: playerId,
                name: (playerName || `プレイヤー${turnOrder + 1}`).trim(),
                sc: 10,
                debt: 0,
                isOwner: false,
                turnOrder,
                odai: null,
                odaiConfirmed: false,
                mode: 'Low',
                gachaDone: false,
                gachaResult: null,
                investDone: false,
                investments: [],
            };
            return {
                state: {
                    ...state,
                    players: [...state.players, newPlayer],
                    invests: [...state.invests, 0],
                },
            };
        });

        if (!result) {
            return NextResponse.json({ error: 'ルームが見つかりません' }, { status: 404 });
        }
        return NextResponse.json({ playerId, state: result.state });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'サーバーエラー' },
            { status: 500 }
        );
    }
}
