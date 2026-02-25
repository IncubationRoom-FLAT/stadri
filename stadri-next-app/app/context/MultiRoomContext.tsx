'use client';

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { MultiRoomState, MultiPlayer, StampEntry } from '@/lib/types';

const POLL_INTERVAL_MS = 1500;

interface MultiRoomContextType {
    roomId: string | null;
    playerId: string | null;
    roomState: MultiRoomState | null;
    myPlayer: MultiPlayer | null;
    isLoading: boolean;
    error: string | null;
    /** Initialize session (called after create/join) */
    initSession: (roomId: string, playerId: string) => void;
    /** Call to confirm own odai */
    confirmOdai: () => Promise<void>;
    /** Call for pitch phase actions */
    pitchAction: (action: string, amount?: number) => Promise<void>;
    /** Call to submit investments */
    submitInvest: (investments: number[]) => Promise<void>;
    /** Call when gacha is done */
    submitGacha: (isSuccess: boolean) => Promise<void>;
    /** Owner: start game */
    startGame: () => Promise<void>;
    /** Owner: restart game */
    restartGame: () => Promise<void>;
    /** Delete room and go home */
    endGame: () => Promise<void>;
    /** Manually refresh state */
    refreshState: () => Promise<void>;
    /** Client-side calculated timeLeft for thinking/pitch timer */
    displayTimeLeft: number;
    /** Call when phase timer expires */
    advancePhase: (fromPhase: string) => Promise<void>;
    /** Send a reaction stamp during pitch phase */
    sendStamp: (stampId: number) => Promise<void>;
    /** Current stamps in room state */
    stamps: StampEntry[];
}

const MultiRoomContext = createContext<MultiRoomContextType | undefined>(undefined);

export function MultiRoomProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [roomId, setRoomId] = useState<string | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [roomState, setRoomState] = useState<MultiRoomState | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [displayTimeLeft, setDisplayTimeLeft] = useState(0);
    const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
    const displayTimerRef = useRef<NodeJS.Timeout | null>(null);
    const latestStateRef = useRef<MultiRoomState | null>(null);

    // Load room & player IDs from localStorage on mount
    useEffect(() => {
        const storedRoomId = localStorage.getItem('multi_room_id');
        const storedPlayerId = localStorage.getItem('multi_player_id');
        if (storedRoomId && storedPlayerId) {
            setRoomId(storedRoomId);
            setPlayerId(storedPlayerId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchState = useCallback(async (rid: string) => {
        try {
            const res = await fetch(`/api/rooms/${encodeURIComponent(rid)}`);
            if (!res.ok) {
                if (res.status === 404) {
                    setRoomState(null);
                }
                return;
            }
            const data = await res.json();
            setRoomState(data.state);
            latestStateRef.current = data.state;
        } catch {
            // silently ignore poll errors
        }
    }, []);

    const refreshState = useCallback(async () => {
        if (roomId) await fetchState(roomId);
    }, [roomId, fetchState]);

    // Auto-polling
    useEffect(() => {
        if (!roomId) return;
        fetchState(roomId);
        pollTimerRef.current = setInterval(() => fetchState(roomId), POLL_INTERVAL_MS);
        return () => {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        };
    }, [roomId, fetchState]);

    // Client-side display timer for thinking/pitch phases
    useEffect(() => {
        if (!roomState) return;
        const state = roomState;

        if (state.phase === 'thinking' || state.phase === 'pitch') {
            const calcDisplay = () => {
                if (!latestStateRef.current) return state.timeLeft;
                const s = latestStateRef.current;
                if (!s.timerActive || !s.timerLastUpdatedAt) return s.timeLeft;
                const elapsed = (Date.now() - new Date(s.timerLastUpdatedAt).getTime()) / 1000;
                return Math.max(0, s.timeLeft - elapsed);
            };

            setDisplayTimeLeft(Math.round(calcDisplay()));
            if (displayTimerRef.current) clearInterval(displayTimerRef.current);
            displayTimerRef.current = setInterval(() => {
                setDisplayTimeLeft(prev => Math.max(0, prev - 1));
            }, 1000);
        } else if (state.phase === 'waiting' || state.phase === 'confirm' || state.phase === 'invest') {
            if (state.phaseStartAt && state.phaseTimeLimitSeconds) {
                const calcRemaining = () => {
                    const elapsed = (Date.now() - new Date(state.phaseStartAt!).getTime()) / 1000;
                    return Math.max(0, state.phaseTimeLimitSeconds! - elapsed);
                };
                setDisplayTimeLeft(Math.round(calcRemaining()));
                if (displayTimerRef.current) clearInterval(displayTimerRef.current);
                displayTimerRef.current = setInterval(() => {
                    setDisplayTimeLeft(prev => Math.max(0, prev - 1));
                }, 1000);
            }
        } else {
            if (displayTimerRef.current) clearInterval(displayTimerRef.current);
        }

        return () => {
            if (displayTimerRef.current) clearInterval(displayTimerRef.current);
        };
    }, [roomState?.phase, roomState?.timerActive, roomState?.phaseStartAt]);

    // Route based on phase changes
    useEffect(() => {
        if (!roomState || !playerId) return;
        const phaseRoutes: Record<string, string> = {
            waiting: '/multi/lobby',
            confirm: '/multi/game/confirm',
            thinking: '/multi/game/thinking',
            pitch: '/multi/game/pitch',
            invest: '/multi/game/invest',
            gacha: '/multi/game/gacha',
            rank: '/multi/game/rank',
        };
        const targetPath = phaseRoutes[roomState.phase];
        if (targetPath && !window.location.pathname.startsWith(targetPath)) {
            router.push(targetPath);
        }
    }, [roomState?.phase, playerId, router]);

    const apiCall = useCallback(
        async (path: string, body: object) => {
            setError(null);
            try {
                const res = await fetch(path, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'エラーが発生しました');
                if (data.state) {
                    setRoomState(data.state);
                    latestStateRef.current = data.state;
                }
                return data;
            } catch (err: any) {
                setError(err.message);
                throw err;
            }
        },
        []
    );

    const startGame = useCallback(async () => {
        if (!roomId || !playerId) return;
        await apiCall(`/api/rooms/${encodeURIComponent(roomId)}/start`, { playerId });
    }, [roomId, playerId, apiCall]);

    const confirmOdai = useCallback(async () => {
        if (!roomId || !playerId) return;
        await apiCall(`/api/rooms/${encodeURIComponent(roomId)}/confirm-odai`, { playerId });
    }, [roomId, playerId, apiCall]);

    const pitchAction = useCallback(
        async (action: string, amount?: number) => {
            if (!roomId || !playerId) return;
            await apiCall(`/api/rooms/${encodeURIComponent(roomId)}/pitch-action`, {
                playerId,
                action,
                amount,
            });
        },
        [roomId, playerId, apiCall]
    );

    const submitInvest = useCallback(
        async (investments: number[]) => {
            if (!roomId || !playerId) return;
            await apiCall(`/api/rooms/${encodeURIComponent(roomId)}/invest`, {
                playerId,
                investments,
            });
        },
        [roomId, playerId, apiCall]
    );

    const submitGacha = useCallback(
        async (isSuccess: boolean) => {
            if (!roomId || !playerId) return;
            await apiCall(`/api/rooms/${encodeURIComponent(roomId)}/gacha`, {
                playerId,
                isSuccess,
            });
        },
        [roomId, playerId, apiCall]
    );

    const restartGame = useCallback(async () => {
        if (!roomId || !playerId) return;
        await apiCall(`/api/rooms/${encodeURIComponent(roomId)}/restart`, { playerId });
    }, [roomId, playerId, apiCall]);

    const endGame = useCallback(async () => {
        if (!roomId) return;
        await fetch(`/api/rooms/${encodeURIComponent(roomId)}`, { method: 'DELETE' });
        localStorage.removeItem('multi_room_id');
        localStorage.removeItem('multi_player_id');
        setRoomState(null);
        setRoomId(null);
        setPlayerId(null);
        router.push('/');
    }, [roomId, router]);

    const initSession = useCallback((rid: string, pid: string) => {
        localStorage.setItem('multi_room_id', rid);
        localStorage.setItem('multi_player_id', pid);
        setRoomId(rid);
        setPlayerId(pid);
    }, []);

    const advancePhase = useCallback(
        async (fromPhase: string) => {
            if (!roomId) return;
            await apiCall(`/api/rooms/${encodeURIComponent(roomId)}/advance`, { fromPhase });
        },
        [roomId, apiCall]
    );

    const sendStamp = useCallback(
        async (stampId: number) => {
            if (!roomId || !playerId) return;
            await apiCall(`/api/rooms/${encodeURIComponent(roomId)}/stamp`, {
                playerId,
                stampId,
            });
        },
        [roomId, playerId, apiCall]
    );

    const myPlayer =
        roomState && playerId
            ? roomState.players.find(p => p.id === playerId) ?? null
            : null;

    const stamps: StampEntry[] = roomState?.stamps ?? [];

    return (
        <MultiRoomContext.Provider
            value={{
                roomId,
                playerId,
                roomState,
                myPlayer,
                isLoading,
                error,
                initSession,
                confirmOdai,
                pitchAction,
                submitInvest,
                submitGacha,
                startGame,
                restartGame,
                endGame,
                refreshState,
                displayTimeLeft,
                advancePhase,
                sendStamp,
                stamps,
            }}
        >
            {children}
        </MultiRoomContext.Provider>
    );
}

export function useMultiRoom() {
    const ctx = useContext(MultiRoomContext);
    if (!ctx) throw new Error('useMultiRoom must be used within MultiRoomProvider');
    return ctx;
}
