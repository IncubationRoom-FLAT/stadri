import pool from './db';
import type { MultiRoomState } from './types';

export async function getRoom(roomId: string): Promise<MultiRoomState | null> {
    const res = await pool.query('SELECT state FROM rooms WHERE id = $1', [roomId]);
    if (!res.rows[0]) return null;
    return res.rows[0].state as MultiRoomState;
}

export async function updateRoomInTransaction<T = undefined>(
    roomId: string,
    updater: (state: MultiRoomState) => { state: MultiRoomState; result?: T }
): Promise<{ state: MultiRoomState; result?: T } | null> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const res = await client.query(
            'SELECT state FROM rooms WHERE id = $1 FOR UPDATE',
            [roomId]
        );
        if (!res.rows[0]) {
            await client.query('ROLLBACK');
            return null;
        }
        const { state, result } = updater(res.rows[0].state as MultiRoomState);
        await client.query(
            'UPDATE rooms SET state = $1 WHERE id = $2',
            [JSON.stringify(state), roomId]
        );
        await client.query('COMMIT');
        return { state, result };
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

/** Calculate the actual timeLeft for thinking/pitch timer */
export function calcTimerTimeLeft(state: MultiRoomState): number {
    if (!state.timerActive || !state.timerLastUpdatedAt) {
        return state.timeLeft;
    }
    const elapsed = (Date.now() - new Date(state.timerLastUpdatedAt).getTime()) / 1000;
    return Math.max(0, state.timeLeft - elapsed);
}
