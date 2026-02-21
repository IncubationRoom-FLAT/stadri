const ICON_COLORS = [
    'black',
    'blue',
    'green',
    'orange',
    'pink',
    'purple',
    'red',
    'yellow',
] as const;

/**
 * turnOrder (0-indexed) からアイコン画像パスを返す。
 * 同じ turnOrder は常に同じアイコンを返すため、セッション中に変わらない。
 */
export function getPlayerIconSrc(turnOrder: number): string {
    const color = ICON_COLORS[turnOrder % ICON_COLORS.length];
    return `/user_icons/user_icon_${color}.jpg`;
}
