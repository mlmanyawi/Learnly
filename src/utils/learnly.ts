import type { Palette, SubjectId } from '@/types';

export function subjectColor(subjectId: SubjectId, colors: Palette) {
  const colorMap: Record<SubjectId, string> = {
    math: colors.subjectMath,
    physics: colors.subjectPhysics,
    chemistry: colors.subjectChemistry,
    biology: colors.subjectBiology,
  };

  return colorMap[subjectId];
}

export function levelFromXp(totalXp: number) {
  const level = Math.floor(totalXp / 1000) + 1;
  const intoLevel = totalXp % 1000;

  return {
    level,
    intoLevel,
    forLevel: 1000,
  };
}

export function createAssistantReply(prompt: string) {
  const lower = prompt.toLowerCase();

  if (lower.includes('quadratic') || lower.includes('math')) {
    return 'Try reading the graph first: vertex, opening direction, and x-intercepts usually tell you which algebra move to use next.';
  }

  if (lower.includes('force') || lower.includes('physics')) {
    return 'Draw a force diagram and ask whether the forces balance. If they do not, the object accelerates in the direction of the net force.';
  }

  if (lower.includes('cell') || lower.includes('biology')) {
    return 'Think of the cell as a coordinated system: membrane controls traffic, nucleus stores instructions, and mitochondria handle energy conversion.';
  }

  if (lower.includes('chem') || lower.includes('atom')) {
    return 'Start with protons: they identify the element. Then use neutrons for isotope mass and electrons for bonding behavior.';
  }

  return 'Break the problem into: what is given, what is changing, which subject idea applies, and what evidence would prove the answer.';
}
