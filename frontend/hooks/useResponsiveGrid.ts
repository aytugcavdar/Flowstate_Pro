/**
 * useResponsiveGrid Hook
 * Calculates optimal grid size based on screen dimensions
 */

import { useState, useEffect } from 'react';

interface GridSize {
  cellSize: number;
  gridSize: number;
  padding: number;
}

/**
 * Calculate optimal grid size for current viewport
 * @param gridCount Number of cells in grid (e.g., 8 for 8x8)
 */
export function useResponsiveGrid(gridCount: number = 8): GridSize {
  const [size, setSize] = useState<GridSize>(() => calculateSize(gridCount));

  useEffect(() => {
    const handleResize = () => {
      setSize(calculateSize(gridCount));
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Initial calculation
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [gridCount]);

  return size;
}

function calculateSize(gridCount: number): GridSize {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 400;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  
  // Account for header (~80px), footer (~100px), and padding
  const availableHeight = vh - 250;
  const availableWidth = vw - 32; // 16px padding on each side
  
  // Grid should be square, use smaller dimension
  const maxGridSize = Math.min(availableWidth, availableHeight, 500); // Max 500px
  const minGridSize = 280; // Min 280px
  
  const gridSize = Math.max(minGridSize, Math.min(maxGridSize, availableWidth));
  const padding = 8;
  const gap = 2;
  const totalGaps = (gridCount - 1) * gap;
  
  // Calculate individual cell size
  const cellSize = Math.floor((gridSize - padding * 2 - totalGaps) / gridCount);
  
  return {
    cellSize,
    gridSize,
    padding
  };
}

/**
 * Get CSS variables for responsive grid
 */
export function getGridStyles(size: GridSize, gridCount: number) {
  return {
    width: `${size.gridSize}px`,
    height: `${size.gridSize}px`,
    padding: `${size.padding}px`,
    gridTemplateColumns: `repeat(${gridCount}, ${size.cellSize}px)`,
    gridTemplateRows: `repeat(${gridCount}, ${size.cellSize}px)`,
    gap: '2px',
  };
}
