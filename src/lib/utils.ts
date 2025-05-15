
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getManaSymbol = (color: string) => {
  const symbols: Record<string, string> = {
    'W': '/mana/white.svg',
    'U': '/mana/blue.svg',
    'B': '/mana/black.svg',
    'R': '/mana/red.svg',
    'G': '/mana/green.svg',
    'C': '/mana/colorless.svg'
  };
  
  return symbols[color] || symbols['C'];
};

export const getDeckColorClass = (colors: string[]) => {
  if (colors.includes('W') && colors.includes('U') && colors.includes('B') && colors.includes('R') && colors.includes('G')) {
    return 'from-magic-purple to-magic-blue'; // 5 color
  } else if (colors.length >= 3) {
    return 'from-magic-purple via-magic-lightPurple to-magic-blue'; // 3+ colors
  } else if (colors.includes('W') && colors.includes('U')) {
    return 'from-slate-100 to-magic-blue'; // Azorius
  } else if (colors.includes('U') && colors.includes('B')) {
    return 'from-magic-blue to-magic-black'; // Dimir
  } else if (colors.includes('B') && colors.includes('R')) {
    return 'from-magic-black to-magic-red'; // Rakdos
  } else if (colors.includes('R') && colors.includes('G')) {
    return 'from-magic-red to-magic-green'; // Gruul
  } else if (colors.includes('G') && colors.includes('W')) {
    return 'from-magic-green to-slate-100'; // Selesnya
  } else if (colors.includes('W') && colors.includes('B')) {
    return 'from-slate-100 to-magic-black'; // Orzhov
  } else if (colors.includes('U') && colors.includes('R')) {
    return 'from-magic-blue to-magic-red'; // Izzet
  } else if (colors.includes('B') && colors.includes('G')) {
    return 'from-magic-black to-magic-green'; // Golgari
  } else if (colors.includes('R') && colors.includes('W')) {
    return 'from-magic-red to-slate-100'; // Boros
  } else if (colors.includes('G') && colors.includes('U')) {
    return 'from-magic-green to-magic-blue'; // Simic
  } else if (colors.includes('W')) {
    return 'from-slate-200 to-slate-100'; // White
  } else if (colors.includes('U')) {
    return 'from-magic-blue to-blue-400'; // Blue
  } else if (colors.includes('B')) {
    return 'from-magic-black to-gray-800'; // Black
  } else if (colors.includes('R')) {
    return 'from-magic-red to-red-400'; // Red
  } else if (colors.includes('G')) {
    return 'from-magic-green to-green-400'; // Green
  } else {
    return 'from-gray-700 to-gray-600'; // Colorless
  }
};
