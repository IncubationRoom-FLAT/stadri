'use client';

import Image from 'next/image';
import { getPlayerIconSrc } from '@/lib/playerIcon';

export type AvatarStatus = 'done' | 'current' | 'pending' | 'neutral';

interface PlayerAvatarProps {
    name: string;
    turnOrder: number;
    /** 表示サイズ (px)。デフォルト 56 */
    size?: number;
    /** 自分自身かどうか → ゴールド枠 */
    isMe?: boolean;
    /** ピッチ進行状態の視覚フィードバック */
    status?: AvatarStatus;
    /** アイコン右上に表示するバッジ文字列 */
    badge?: string;
}

export default function PlayerAvatar({
    name,
    turnOrder,
    size = 56,
    isMe = false,
    status = 'neutral',
    badge,
}: PlayerAvatarProps) {
    const borderColor =
        isMe || status === 'current'
            ? 'var(--gold, #f0c040)'
            : status === 'done'
            ? '#6bcb77'
            : 'rgba(255,255,255,0.18)';

    const opacity = status === 'pending' ? 0.45 : 1;

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                opacity,
                position: 'relative',
            }}
        >
            {/* アイコン本体 */}
            <div
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: `2px solid ${borderColor}`,
                    boxShadow:
                        status === 'current' || isMe
                            ? '0 0 8px rgba(240,192,64,0.6)'
                            : undefined,
                    flexShrink: 0,
                    position: 'relative',
                }}
            >
                <Image
                    src={getPlayerIconSrc(turnOrder)}
                    alt={name}
                    width={size}
                    height={size}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
                {/* 完了オーバーレイ */}
                {status === 'done' && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(107,203,119,0.45)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: size * 0.4,
                        }}
                    >
                        ✓
                    </div>
                )}
            </div>

            {/* バッジ */}
            {badge && (
                <span
                    style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        background: 'var(--gold, #f0c040)',
                        color: '#000',
                        fontSize: '0.58rem',
                        padding: '1px 5px',
                        borderRadius: 8,
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {badge}
                </span>
            )}

            {/* プレイヤー名 */}
            <span
                style={{
                    fontSize: '0.68rem',
                    color: 'var(--text-muted, #ccc)',
                    maxWidth: size + 12,
                    textAlign: 'center',
                    wordBreak: 'break-all',
                    lineHeight: 1.2,
                }}
            >
                {name}
            </span>
        </div>
    );
}
