import { NextRequest, NextResponse } from 'next/server';
import { updateRoomInTransaction } from '@/lib/roomUtils';
import type { StampEntry } from '@/lib/types';

/**
 * POST /api/rooms/[id]/stamp
 * Body: { playerId: string; stampId: number }
 *
 * Adds a stamp entry to the current pitch turn.
 * Only allowed while phase === 'pitch' and timerActive === true.
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { playerId, stampId } = await request.json();

        if (typeof stampId !== 'number' || stampId < 1 || stampId > 15) {
            return NextResponse.json({ error: '不正なスタンプIDです' }, { status: 400 });
        }

        const result = await updateRoomInTransaction(id, (state) => {
            if (state.phase !== 'pitch') {
                throw new Error('プレゼンタイム以外ではスタンプを送れません');
            }
            if (!state.timerActive) {
                throw new Error('タイマーが動いていないときはスタンプを送れません');
            }

            const player = state.players.find(p => p.id === playerId);
            if (!player) throw new Error('プレイヤーが見つかりません');

            // Presenter cannot send stamps to themselves
            const presenter = state.players[state.pIdx];
            if (presenter?.id === playerId) {
                throw new Error('発表者はスタンプを送れません');
            }

            const entry: StampEntry = {
                eid: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                stampId,
                fromPlayerName: player.name,
                sentAt: new Date().toISOString(),
            };

            const currentStamps = state.stamps ?? [];
            // Keep last 100 stamps to avoid unbounded growth
            const trimmed = currentStamps.length >= 100
                ? currentStamps.slice(currentStamps.length - 99)
                : currentStamps;

            return {
                state: {
                    ...state,
                    stamps: [...trimmed, entry],
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
