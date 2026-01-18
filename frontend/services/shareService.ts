/**
 * ShareService - Canvas-based visual share card generation
 * Creates beautiful shareable images for game results
 */

export interface ShareCardData {
  moves: number;
  timeMs: number;
  mode: 'DAILY' | 'PRACTICE' | 'CAMPAIGN';
  dateKey: string;
  rank?: string;
  stars?: number;
  streak?: number;
  xpGained?: number;
}

// Color palette for the card
const COLORS = {
  bgGradientStart: '#0f172a',
  bgGradientEnd: '#1e1b4b',
  accent1: '#06b6d4', // cyan
  accent2: '#d946ef', // fuchsia
  text: '#ffffff',
  textMuted: '#94a3b8',
  gold: '#fbbf24',
};

/**
 * Generate a visual share card using Canvas API
 */
// generateShareCard removed in favor of React Component + html2canvas approach

/**
 * Download canvas as PNG image
 */
export function downloadAsImage(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Get share URLs for social platforms
 */
export function getShareUrls(text: string): { twitter: string; telegram: string } {
  const encodedText = encodeURIComponent(text);
  
  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
    telegram: `https://t.me/share/url?text=${encodedText}`,
  };
}

/**
 * Generate share text for clipboard
 */
export function generateShareText(data: ShareCardData): string {
  let modeText = 'Practice Run';
  if (data.mode === 'DAILY') {
    modeText = `Daily ${data.dateKey}`;
  } else if (data.mode === 'CAMPAIGN') {
    modeText = `Campaign ${data.stars ? '★'.repeat(data.stars) : ''}`;
  }
  
  const seconds = Math.floor(data.timeMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const timeStr = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  
  return `FLOWSTATE ${modeText}\n${data.moves} Moves | ${timeStr}\n⚡ SYSTEM HACKED`;
}
