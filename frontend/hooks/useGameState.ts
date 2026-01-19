
import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Grid, NodeStatus, TileType, GridPos } from '../types';
import { calculateFlow, checkWinCondition } from '../services/gameLogic';
import { generateDailyLevel } from '../services/levelGenerator';
import { getHintFromSolution } from '../services/solutionService';
import { playSound } from '../services/audio';
import { STORAGE_KEY_STATE } from '../constants';
import { haptic } from '../services/hapticService';

// Move history entry for undo
interface MoveHistoryEntry {
    position: GridPos;
    previousRotation: number;
}

export const useGameState = (gameKey: string) => {
    const [grid, setGrid] = useState<Grid>([]);
    const [moves, setMoves] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [charges, setCharges] = useState(0);
    const [loading, setLoading] = useState(true);
    const hasChargedRef = useRef(false);
    
    // Move history for undo power-up
    const [moveHistory, setMoveHistory] = useState<MoveHistoryEntry[]>([]);

    // Load or Init Game
    useEffect(() => {
        setLoading(true);
        const storageKey = `FLOWSTATE_${gameKey}_V4`;
        const saved = localStorage.getItem(storageKey);
        
        if (saved) {
            try {
                const state: GameState = JSON.parse(saved);
                if (state.gameDate === gameKey) {
                    // If the game was won and it's a replayable mode, start fresh
                    const isCampaignLevel = gameKey.startsWith('INIT_') || 
                                           gameKey.startsWith('SPRAWL_') || 
                                           gameKey.startsWith('DEEP_') || 
                                           gameKey.startsWith('CORE_') || 
                                           gameKey.startsWith('OMEGA_');
                    const isPractice = gameKey.startsWith('PRACTICE_');
                    const isReplayable = isCampaignLevel || isPractice;
                    
                    if (state.isWon && isReplayable) {
                        // Don't load won replayable games from cache - allow replay
                        console.log('[useGameState] Skipping cache for completed replayable level');
                    } else {
                        setGrid(state.grid);
                        setMoves(state.moves);
                        setIsWon(state.isWon);
                        setCharges(state.charges);
                        hasChargedRef.current = state.charges > 0;
                        setMoveHistory([]);
                        setLoading(false);
                        return;
                    }
                }
            } catch (e) { console.error("Save load error", e); }
        }

        // New Game
        const newGrid = generateDailyLevel(gameKey);
        setGrid(newGrid);
        setMoves(0);
        setIsWon(false);
        setCharges(0);
        setMoveHistory([]);
        hasChargedRef.current = false;
        setLoading(false);

    }, [gameKey]);

    // Persistence
    useEffect(() => {
        if (!loading && grid.length > 0) {
            const storageKey = `FLOWSTATE_${gameKey}_V4`;
            const state: GameState = { grid, moves, isWon, gameDate: gameKey, charges };
            localStorage.setItem(storageKey, JSON.stringify(state));
        }
    }, [grid, moves, isWon, charges, loading, gameKey]);

    // Mechanics: Key/Lock & Capacitor Charging
    useEffect(() => {
        if (loading || isWon) return;
        if (moves === 0) hasChargedRef.current = false;

        let keyPowered = false;
        let capPowered = false;
        
        grid.flat().forEach(t => {
            if (t.status === NodeStatus.KEY && t.hasFlow) keyPowered = true;
            if (t.status === NodeStatus.CAPACITOR && t.hasFlow) capPowered = true;
        });

        // Unlock Logic
        const hasLockedNodes = grid.flat().some(t => t.status === NodeStatus.LOCKED && t.fixed);
        if (keyPowered && hasLockedNodes) {
            playSound('power'); 
            setGrid(prev => prev.map(row => row.map(t => {
                if (t.status === NodeStatus.LOCKED) return { ...t, fixed: false };
                return t;
            })));
        }

        // Charge Logic
        if (capPowered && charges === 0 && !hasChargedRef.current) {
            playSound('power');
            setCharges(1);
            hasChargedRef.current = true;
        }
    }, [grid, isWon, loading, charges, moves]);

    const onTileClick = useCallback((r: number, c: number) => {
        if (isWon || loading) return;
        const tile = grid[r][c];
        
        // Ability: Zap Bug
        if (tile.status === NodeStatus.FORBIDDEN && charges > 0) {
            playSound('power'); 
            haptic.powerupUse();
            const newGrid = grid.map(row => row.map(t => ({...t})));
            newGrid[r][c] = { ...newGrid[r][c], status: NodeStatus.NORMAL, fixed: false };
            setCharges(0);
            setGrid(calculateFlow(newGrid));
            return;
        }

        if (tile.fixed) {
            if (tile.status === NodeStatus.LOCKED) playSound('click');
            return;
        }

        // Record move for undo history
        const previousRotation = tile.rotation;
        
        playSound('rotate');
        const newGrid = grid.map(row => row.map(t => ({ ...t })));
        newGrid[r][c].rotation = (newGrid[r][c].rotation + 1) % 4;
        
        const flowedGrid = calculateFlow(newGrid);
        
        // Glitch Sound Check
        const hasNewGlitch = flowedGrid.flat().some((t, i) => 
            t.status === NodeStatus.FORBIDDEN && t.hasFlow && !grid.flat()[i].hasFlow
        );
        if (hasNewGlitch) {
            haptic.error();
            playSound('glitch');
        }

        const prevPower = grid.flat().filter(t => t.hasFlow).length;
        const newPower = flowedGrid.flat().filter(t => t.hasFlow).length;
        if (newPower > prevPower && !hasNewGlitch) {
            playSound('power');
            haptic.tileFlow();
        }

        // Add to move history (limit to 20 moves)
        setMoveHistory(prev => [...prev.slice(-19), { position: { r, c }, previousRotation }]);
        
        setGrid(flowedGrid);
        setMoves(m => m + 1);

        if (checkWinCondition(flowedGrid)) {
            setIsWon(true);
            haptic.levelComplete();
        }
    }, [grid, isWon, loading, charges]);

    // Undo last move (for power-up)
    const undoLastMove = useCallback((): boolean => {
        if (isWon || loading || moveHistory.length === 0) return false;
        
        const lastMove = moveHistory[moveHistory.length - 1];
        const { position, previousRotation } = lastMove;
        
        playSound('click');
        haptic.powerupUse();
        
        const newGrid = grid.map(row => row.map(t => ({ ...t })));
        newGrid[position.r][position.c].rotation = previousRotation;
        
        const flowedGrid = calculateFlow(newGrid);
        
        setGrid(flowedGrid);
        setMoves(m => Math.max(0, m - 1));
        setMoveHistory(prev => prev.slice(0, -1));
        
        return true;
    }, [grid, isWon, loading, moveHistory]);

    // Get hint for a tile that is currently wrong (uses stored solution)
    const getHintableTile = useCallback((): { position: GridPos; correctRotation: number } | null => {
        if (isWon || loading) return null;
        
        // First try to get hint from stored solution (most accurate)
        const storedHint = getHintFromSolution(gameKey, grid);
        if (storedHint) {
            return storedHint;
        }
        
        // Fallback: Find tiles that could be rotated to improve flow
        // This is used when no solution is stored (shouldn't happen normally)
        console.log('[useGameState] No stored solution, using fallback hint');
        const rotatableTiles: { r: number; c: number; tile: typeof grid[0][0] }[] = [];
        
        grid.forEach((row, r) => {
            row.forEach((tile, c) => {
                if (!tile.fixed && 
                    tile.type !== TileType.EMPTY && 
                    tile.type !== TileType.BLOCK &&
                    tile.type !== TileType.SOURCE &&
                    tile.type !== TileType.SINK) {
                    rotatableTiles.push({ r, c, tile });
                }
            });
        });
        
        if (rotatableTiles.length === 0) return null;
        
        // Pick a random tile and find best rotation
        const randomTile = rotatableTiles[Math.floor(Math.random() * rotatableTiles.length)];
        let bestRotation = randomTile.tile.rotation;
        let bestPower = grid.flat().filter(t => t.hasFlow).length;
        
        for (let rot = 0; rot < 4; rot++) {
            if (rot === randomTile.tile.rotation) continue;
            
            const testGrid = grid.map(row => row.map(t => ({ ...t })));
            testGrid[randomTile.r][randomTile.c].rotation = rot;
            const flowedTest = calculateFlow(testGrid);
            const power = flowedTest.flat().filter(t => t.hasFlow).length;
            
            if (power > bestPower) {
                bestPower = power;
                bestRotation = rot;
            }
        }
        
        return {
            position: { r: randomTile.r, c: randomTile.c },
            correctRotation: bestRotation
        };
    }, [grid, isWon, loading, gameKey]);

    // Apply hint - rotate tile to the suggested rotation
    const applyHint = useCallback((r: number, c: number, targetRotation: number) => {
        if (isWon || loading) return;
        
        const tile = grid[r][c];
        if (tile.fixed) return;
        
        // Calculate rotations needed
        const currentRotation = tile.rotation;
        const rotationsNeeded = (targetRotation - currentRotation + 4) % 4;
        
        if (rotationsNeeded === 0) return;
        
        playSound('power');
        haptic.powerupUse();
        
        // Record for undo
        const previousRotation = tile.rotation;
        
        const newGrid = grid.map(row => row.map(t => ({ ...t })));
        newGrid[r][c].rotation = targetRotation;
        
        const flowedGrid = calculateFlow(newGrid);
        
        setMoveHistory(prev => [...prev.slice(-19), { position: { r, c }, previousRotation }]);
        setGrid(flowedGrid);
        setMoves(m => m + 1);
        
        if (checkWinCondition(flowedGrid)) {
            setIsWon(true);
            haptic.levelComplete();
        }
    }, [grid, isWon, loading]);

    const resetGame = () => {
        if (isWon) return;
        playSound('glitch');
        const resetGrid = generateDailyLevel(gameKey);
        setGrid(resetGrid);
        setMoves(0);
        setCharges(0);
        setMoveHistory([]);
        hasChargedRef.current = false;
    };

    const canUndo = moveHistory.length > 0 && !isWon;

    return {
        grid,
        moves,
        isWon,
        charges,
        loading,
        onTileClick,
        resetGame,
        setGrid,
        // Power-up related
        canUndo,
        undoLastMove,
        getHintableTile,
        applyHint,
    };
};
