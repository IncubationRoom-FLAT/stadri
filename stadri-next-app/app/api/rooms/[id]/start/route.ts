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
                throw new Error('オーナーのみがゲームを開始できます');
            }
            if (state.players.length < 2) {
                throw new Error('プレイヤーが2人以上必要です');
            }
            if (state.phase !== 'waiting') {
                throw new Error('ゲームはすでに開始されています');
            }

            const odais = assignOdai(state.players.length);
            const updatedPlayers = state.players.map((p, i) => ({
                ...p,
                odai: odais[i],
                odaiConfirmed: false,
            }));

            return {
                state: {
                    ...state,
                    phase: 'confirm' as const,
                    players: updatedPlayers,
                    phaseStartAt: new Date().toISOString(),
                    phaseTimeLimitSeconds: 30,
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
