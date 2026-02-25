import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { MultiPlayer, MultiRoomState } from '@/lib/types';

export async function POST(request: NextRequest) {
    try {
        const { roomId, playerName } = await request.json();

        const trimmedId = (roomId || '').trim();
        if (trimmedId.length < 3) {
            return NextResponse.json(
                { error: 'ルームIDは3文字以上で入力してください' },
                { status: 400 }
            );
        }

        // Check if room already exists
        const existing = await pool.query('SELECT id FROM rooms WHERE id = $1', [trimmedId]);
        if (existing.rows.length > 0) {
            return NextResponse.json(
                { error: 'そのルームIDはすでに使用中です。別のIDを試してください' },
                { status: 409 }
            );
        }

        const playerId = crypto.randomUUID();

        const ownerPlayer: MultiPlayer = {
            id: playerId,
            name: (playerName || 'オーナー').trim(),
            sc: 10,
            debt: 0,
            isOwner: true,
            turnOrder: 0,
            odai: null,
            odaiConfirmed: false,
            mode: 'Low',
            gachaDone: false,
            gachaResult: null,
            investDone: false,
            investments: [],
        };

        const state: MultiRoomState = {
            phase: 'waiting',
            curR: 1,
            pIdx: 0,
            players: [ownerPlayer],
            invests: [0],
            invLog: [],
            phaseStartAt: new Date().toISOString(),
            phaseTimeLimitSeconds: 180,
            timerActive: false,
            timeLeft: 180,
            timerLastUpdatedAt: null,
            finalRanking: null,
            stamps: [],
        };

        await pool.query(
            'INSERT INTO rooms (id, state) VALUES ($1, $2)',
            [trimmedId, JSON.stringify(state)]
        );

        return NextResponse.json({ playerId, roomId: trimmedId, state });
    } catch (error: any) {
        console.error('Error creating room:', error);
        return NextResponse.json(
            { error: 'サーバーエラーが発生しました' },
            { status: 500 }
        );
    }
}
