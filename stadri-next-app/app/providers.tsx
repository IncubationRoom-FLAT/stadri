'use client';

import { GameProvider } from './context/GameContext';
import { MultiRoomProvider } from './context/MultiRoomContext';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <GameProvider>
            <MultiRoomProvider>{children}</MultiRoomProvider>
        </GameProvider>
    );
}
