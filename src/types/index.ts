import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';

export type ThemeMode = 'light' | 'dark';
export type AccentId = 'ember' | 'signal' | 'mint' | 'violet' | 'rose';
export type SubjectId = 'math' | 'physics' | 'chemistry' | 'biology';
export type TabId = 'learn' | 'quiz' | 'chat' | 'profile';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type LessonBlockKind = 'text' | 'definition' | 'formula' | 'diagram' | 'link';
export type IconComponent = ComponentType<LucideProps>;

export interface Palette {
  bg: string;
  card: string;
  cardAlt: string;
  text: string;
  textSoft: string;
  textFaint: string;
  border: string;
  ember: string;
  emberSoft: string;
  emberDeep: string;
  signal: string;
  mint: string;
  gold: string;
  danger: string;
  chip: string;
  paper: string;
  subjectMath: string;
  subjectPhysics: string;
  subjectChemistry: string;
  subjectBiology: string;
}

export interface Subject {
  id: SubjectId;
  title: string;
  subtitle: string;
  summary: string;
  progress: number;
  lessons: number;
  icon: IconComponent;
}

export interface LessonBlock {
  id: string;
  kind: LessonBlockKind;
  title?: string;
  body: string;
  accent?: string;
}

export interface Lesson {
  id: string;
  subjectId: SubjectId;
  title: string;
  subtitle: string;
  duration: string;
  xp: number;
  sections: LessonBlock[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  subjectId: SubjectId;
  title: string;
  difficulty: Difficulty;
  xp: number;
  questions: QuizQuestion[];
}

export interface WordEntry {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  synonyms: string[];
  subjectId: SubjectId;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
}

export interface DayXp {
  label: string;
  xp: number;
}

export interface UserProfile {
  displayName: string;
  handle: string;
  streak: number;
  totalXp: number;
  completedLessons: number;
  quizAverage: number;
  history: DayXp[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}
