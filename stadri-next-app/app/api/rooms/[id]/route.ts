import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const res = await pool.query('SELECT state FROM rooms WHERE id = $1', [id]);
    if (!res.rows[0]) {
        return NextResponse.json({ error: 'ルームが見つかりません' }, { status: 404 });
    }
    return NextResponse.json({ state: res.rows[0].state });
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await pool.query('DELETE FROM rooms WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
}
