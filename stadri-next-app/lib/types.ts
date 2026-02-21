export interface MultiPlayer {
    id: string;
    name: string;
    sc: number;
    debt: number;
    isOwner: boolean;
    turnOrder: number;
    odai: { cat: string; prob: string } | null;
    odaiConfirmed: boolean;
    mode: 'Low' | 'High';
    gachaDone: boolean;
    gachaResult: { isSuccess: boolean; gain: number } | null;
    investDone: boolean;
    /** investments[targetTurnOrder] = amount this player invests in that player */
    investments: number[];
}

export interface MultiRoomState {
    phase: 'waiting' | 'confirm' | 'thinking' | 'pitch' | 'invest' | 'gacha' | 'rank';
    curR: number;
    /** Current presenter index (used in pitch phase) */
    pIdx: number;
    players: MultiPlayer[];
    /** Total investment received by each player (indexed by turnOrder) */
    invests: number[];
    invLog: InvLogEntry[];
    /** When the current phase started (ISO string) */
    phaseStartAt: string | null;
    /** Time limit for the current phase in seconds (null = no limit) */
    phaseTimeLimitSeconds: number | null;
    /** For thinking/pitch: whether the timer is actively counting down */
    timerActive: boolean;
    /** Remaining seconds (updated each time timer starts/stops/adjusts) */
    timeLeft: number;
    /** When timeLeft was last persisted (ISO string) */
    timerLastUpdatedAt: string | null;
    finalRanking: { name: string; score: number }[] | null;
}

export interface InvLogEntry {
    round: number;
    presenterName: string;
    totalInvest: number;
    mode: string;
    isSuccess: boolean;
    gain: number;
    investors: { name: string; amount: number; bonus: number }[];
}
