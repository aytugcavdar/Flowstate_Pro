/**
 * Solution Service - Stores and retrieves puzzle solutions
 * 
 * This service ensures:
 * 1. Every puzzle has a guaranteed solution stored
 * 2. Hints come from the real solution
 * 3. Players can always solve the puzzle
 */

import { Grid, TileState, TileType, GridPos } from '../types';
import { GRID_SIZE } from '../constants';

// ============================================
// TYPES
// ============================================

export interface TileSolution {
  r: number;
  c: number;
  rotation: number;
}

export interface PuzzleSolution {
  gameKey: string;
  tiles: TileSolution[];
  generatedAt: number;
}

const STORAGE_KEY = 'flowstate_solutions_v1';
const MAX_STORED_SOLUTIONS = 50; // Keep last 50 solutions

// ============================================
// SOLUTION STORAGE
// ============================================

/**
 * Store the solution for a puzzle
 */
export function storeSolution(gameKey: string, grid: Grid): void {
  try {
    const solutions = loadAllSolutions();
    
    // Extract rotations for non-fixed rotatable tiles
    const tiles: TileSolution[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const tile = grid[r][c];
        // Store solution for tiles that can be rotated
        if (!tile.fixed && tile.type !== TileType.EMPTY && tile.type !== TileType.BLOCK) {
          tiles.push({ r, c, rotation: tile.rotation });
        }
      }
    }
    
    const solution: PuzzleSolution = {
      gameKey,
      tiles,
      generatedAt: Date.now()
    };
    
    // Add new solution
    solutions[gameKey] = solution;
    
    // Cleanup old solutions (keep most recent)
    const keys = Object.keys(solutions);
    if (keys.length > MAX_STORED_SOLUTIONS) {
      const sorted = keys.sort((a, b) => solutions[b].generatedAt - solutions[a].generatedAt);
      const toKeep = sorted.slice(0, MAX_STORED_SOLUTIONS);
      const newSolutions: Record<string, PuzzleSolution> = {};
      toKeep.forEach(k => newSolutions[k] = solutions[k]);
      saveSolutions(newSolutions);
    } else {
      saveSolutions(solutions);
    }
    
    console.log(`[Solution] Stored solution for ${gameKey} with ${tiles.length} tiles`);
  } catch (e) {
    console.warn('[Solution] Failed to store:', e);
  }
}

/**
 * Get the stored solution for a puzzle
 */
export function getSolution(gameKey: string): PuzzleSolution | null {
  try {
    const solutions = loadAllSolutions();
    return solutions[gameKey] || null;
  } catch {
    return null;
  }
}

/**
 * Get a hint from the stored solution
 * Returns a tile that is currently wrong and its correct rotation
 */
export function getHintFromSolution(
  gameKey: string, 
  currentGrid: Grid
): { position: GridPos; correctRotation: number } | null {
  const solution = getSolution(gameKey);
  if (!solution) {
    console.log('[Solution] No stored solution for', gameKey);
    return null;
  }
  
  // Find tiles that don't match the solution
  const wrongTiles: TileSolution[] = [];
  
  for (const tile of solution.tiles) {
    const current = currentGrid[tile.r][tile.c];
    if (current.rotation !== tile.rotation && !current.fixed) {
      wrongTiles.push(tile);
    }
  }
  
  if (wrongTiles.length === 0) {
    console.log('[Solution] All tiles are correct!');
    return null;
  }
  
  // Pick a random wrong tile
  const hint = wrongTiles[Math.floor(Math.random() * wrongTiles.length)];
  
  console.log(`[Solution] Hint: Tile (${hint.r},${hint.c}) should be rotation ${hint.rotation}`);
  
  return {
    position: { r: hint.r, c: hint.c },
    correctRotation: hint.rotation
  };
}

/**
 * Check how many tiles are correct
 */
export function checkProgress(gameKey: string, currentGrid: Grid): { correct: number; total: number } {
  const solution = getSolution(gameKey);
  if (!solution) {
    return { correct: 0, total: 0 };
  }
  
  let correct = 0;
  for (const tile of solution.tiles) {
    const current = currentGrid[tile.r][tile.c];
    if (current.rotation === tile.rotation) {
      correct++;
    }
  }
  
  return { correct, total: solution.tiles.length };
}

// ============================================
// INTERNAL HELPERS
// ============================================

function loadAllSolutions(): Record<string, PuzzleSolution> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveSolutions(solutions: Record<string, PuzzleSolution>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(solutions));
  } catch (e) {
    console.warn('[Solution] Failed to save:', e);
  }
}

/**
 * Clear all stored solutions (for debugging)
 */
export function clearAllSolutions(): void {
  localStorage.removeItem(STORAGE_KEY);
  console.log('[Solution] All solutions cleared');
}
