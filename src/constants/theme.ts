import type { AccentId, Palette, SubjectId, ThemeMode } from '@/types';

export const accents: Record<AccentId, { label: string; dark: [string, string]; light: [string, string] }> = {
  ember: {
    label: 'Ember',
    dark: ['#FF6B4A', '#D6482C'],
    light: ['#E85B3B', '#C4451E'],
  },
  signal: {
    label: 'Signal Blue',
    dark: ['#5B8CFF', '#3D63D6'],
    light: ['#3D63D6', '#2A48AE'],
  },
  mint: {
    label: 'Mint',
    dark: ['#4ADE9F', '#1FAE79'],
    light: ['#1FAE79', '#167F58'],
  },
  violet: {
    label: 'Violet',
    dark: ['#B18CFF', '#8257E5'],
    light: ['#8257E5', '#6A3FC7'],
  },
  rose: {
    label: 'Rose',
    dark: ['#FF7FA6', '#E14D78'],
    light: ['#E14D78', '#C22F5C'],
  },
};

export const subjectHues: Record<SubjectId, { dark: string; light: string }> = {
  math: { dark: '#5B8CFF', light: '#2A56D6' },
  physics: { dark: '#FF6B6B', light: '#D6392F' },
  chemistry: { dark: '#F2C14B', light: '#B9821A' },
  biology: { dark: '#4ADE9F', light: '#1B9E68' },
};

export const palettes: Record<ThemeMode, Palette> = {
  dark: {
    bg: '#0B0D12',
    card: '#13161F',
    cardAlt: '#191D29',
    text: '#F3F1EC',
    textSoft: '#A6ABBC',
    textFaint: '#5F6577',
    border: 'rgba(243,241,236,0.08)',
    ember: '#FF6B4A',
    emberSoft: '#FF6B4A26',
    emberDeep: '#D6482C',
    signal: '#5B8CFF',
    mint: '#4ADE9F',
    gold: '#F2B84B',
    danger: '#FF5D6C',
    chip: '#1B1F2B',
    paper: '#0D0F16',
    subjectMath: subjectHues.math.dark,
    subjectPhysics: subjectHues.physics.dark,
    subjectChemistry: subjectHues.chemistry.dark,
    subjectBiology: subjectHues.biology.dark,
  },
  light: {
    bg: '#FAF7F2',
    card: '#FFFFFF',
    cardAlt: '#F7F3EC',
    text: '#1B1A17',
    textSoft: '#68655D',
    textFaint: '#A39E92',
    border: 'rgba(38,32,20,0.09)',
    ember: '#E85B3B',
    emberSoft: '#E85B3B1F',
    emberDeep: '#C4451E',
    signal: '#3D63D6',
    mint: '#1FAE79',
    gold: '#C98A1E',
    danger: '#E14D5C',
    chip: '#F0EBE1',
    paper: '#FFFFFF',
    subjectMath: subjectHues.math.light,
    subjectPhysics: subjectHues.physics.light,
    subjectChemistry: subjectHues.chemistry.light,
    subjectBiology: subjectHues.biology.light,
  },
};

export function applyAccent(base: Palette, mode: ThemeMode, accent: AccentId): Palette {
  const [main, deep] = accents[accent][mode];

  return {
    ...base,
    ember: main,
    emberDeep: deep,
    emberSoft: mode === 'dark' ? `${main}26` : `${main}1F`,
  };
}
