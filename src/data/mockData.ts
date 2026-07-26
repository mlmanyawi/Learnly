import { Atom, Dna, FlaskConical, Sigma } from 'lucide-react-native';
import type { ChatMessage, Lesson, NotificationItem, Quiz, Subject, UserProfile, WordEntry } from '@/types';

export const subjects: Subject[] = [
  {
    id: 'math',
    title: 'Mathematics',
    subtitle: 'Quadratics, trigonometry, limits',
    summary: 'Build pattern fluency with functions, graphs, proofs, and calculus foundations.',
    progress: 0.72,
    lessons: 3,
    icon: Sigma,
  },
  {
    id: 'physics',
    title: 'Physics',
    subtitle: 'Forces, motion, waves',
    summary: 'Connect equations to real-world motion, energy, momentum, and measurement.',
    progress: 0.48,
    lessons: 3,
    icon: Atom,
  },
  {
    id: 'chemistry',
    title: 'Chemistry',
    subtitle: 'Atoms, reactions, bonding',
    summary: 'Understand matter from atomic structure to acids, bases, and reaction patterns.',
    progress: 0.61,
    lessons: 3,
    icon: FlaskConical,
  },
  {
    id: 'biology',
    title: 'Biology',
    subtitle: 'Cells, genetics, evolution',
    summary: 'Explore how living systems store information, use energy, and adapt.',
    progress: 0.39,
    lessons: 3,
    icon: Dna,
  },
];

export const lessons: Lesson[] = [
  {
    id: 'quadratics',
    subjectId: 'math',
    title: 'Quadratics without panic',
    subtitle: 'Factor, complete the square, and read parabolas visually.',
    duration: '18 min',
    xp: 80,
    sections: [
      {
        id: 'q1',
        kind: 'text',
        title: 'The shape tells a story',
        body: 'A quadratic is any function whose highest power is x². Its graph is a parabola, and the vertex is the turning point where the function changes direction.',
      },
      {
        id: 'q2',
        kind: 'formula',
        title: 'Vertex form',
        body: 'f(x) = a(x - h)² + k. The point (h, k) is the vertex, and a controls whether the curve opens upward or downward.',
      },
      {
        id: 'q3',
        kind: 'definition',
        title: 'Discriminant',
        body: 'The value b² - 4ac tells how many real x-intercepts a quadratic has: two, one, or none.',
      },
    ],
  },
  {
    id: 'trig',
    subjectId: 'math',
    title: 'Trigonometry identities lab',
    subtitle: 'Use the unit circle to make sine and cosine feel natural.',
    duration: '21 min',
    xp: 95,
    sections: [
      {
        id: 't1',
        kind: 'text',
        title: 'Unit circle memory hook',
        body: 'Cosine is the x-coordinate and sine is the y-coordinate of a point moving around a circle of radius one.',
      },
      {
        id: 't2',
        kind: 'formula',
        title: 'Pythagorean identity',
        body: 'sin²(θ) + cos²(θ) = 1. This comes directly from x² + y² = 1 on the unit circle.',
      },
    ],
  },
  {
    id: 'newton',
    subjectId: 'physics',
    title: 'Newton in motion',
    subtitle: 'Read forces as interactions and predict acceleration.',
    duration: '20 min',
    xp: 90,
    sections: [
      {
        id: 'n1',
        kind: 'text',
        title: 'Forces change motion',
        body: 'A net force changes velocity. If the forces balance, an object can still move, but its velocity stays constant.',
      },
      {
        id: 'n2',
        kind: 'formula',
        title: 'Second law',
        body: 'F = ma. More force means more acceleration; more mass means the same force produces less acceleration.',
      },
    ],
  },
  {
    id: 'atoms',
    subjectId: 'chemistry',
    title: 'Atomic structure tour',
    subtitle: 'Protons, neutrons, electrons, and isotope notation.',
    duration: '17 min',
    xp: 85,
    sections: [
      {
        id: 'a1',
        kind: 'definition',
        title: 'Atomic number',
        body: 'The atomic number is the number of protons. It identifies the element.',
      },
      {
        id: 'a2',
        kind: 'text',
        title: 'Isotopes',
        body: 'Isotopes are atoms of the same element with different numbers of neutrons.',
      },
    ],
  },
  {
    id: 'cells',
    subjectId: 'biology',
    title: 'Cell structure studio',
    subtitle: 'Organelles, membranes, and energy conversion.',
    duration: '19 min',
    xp: 90,
    sections: [
      {
        id: 'c1',
        kind: 'text',
        title: 'Cells are systems',
        body: 'A cell is a small organized system. Each organelle contributes a specialized job, like energy production, transport, or information storage.',
      },
      {
        id: 'c2',
        kind: 'definition',
        title: 'Homeostasis',
        body: 'Homeostasis is the maintenance of stable internal conditions even when the outside environment changes.',
      },
    ],
  },
];

export const quizzes: Quiz[] = [
  {
    id: 'mixed-stem',
    subjectId: 'math',
    title: 'Mixed STEM warmup',
    difficulty: 'Medium',
    xp: 120,
    questions: [
      {
        id: 'mq1',
        prompt: 'Which quantity describes instantaneous rate of change?',
        choices: ['Integral', 'Derivative', 'Isotope', 'Catalyst'],
        answerIndex: 1,
        explanation: 'A derivative measures how fast a function changes at one point.',
      },
      {
        id: 'mq2',
        prompt: 'Momentum is calculated as...',
        choices: ['mass × velocity', 'force ÷ time', 'charge × distance', 'moles ÷ liter'],
        answerIndex: 0,
        explanation: 'Linear momentum equals mass times velocity.',
      },
      {
        id: 'mq3',
        prompt: 'A catalyst changes a reaction by...',
        choices: ['Increasing rate', 'Adding protons', 'Stopping equilibrium', 'Creating genes'],
        answerIndex: 0,
        explanation: 'Catalysts speed reactions without being consumed.',
      },
    ],
  },
  {
    id: 'bio-cells',
    subjectId: 'biology',
    title: 'Cells and systems',
    difficulty: 'Easy',
    xp: 85,
    questions: [
      {
        id: 'bq1',
        prompt: 'Which organelle is strongly associated with ATP production?',
        choices: ['Ribosome', 'Mitochondrion', 'Nucleus', 'Golgi body'],
        answerIndex: 1,
        explanation: 'Mitochondria convert energy from food molecules into ATP.',
      },
    ],
  },
];

export const wordBank: WordEntry[] = [
  {
    word: 'Asymptote',
    phonetic: 'as-əm(p)-tōt',
    partOfSpeech: 'noun',
    definition: 'A line that a curve approaches but never quite touches as it stretches to infinity.',
    example: 'As x grows larger, the curve hugs the horizontal asymptote at y = 0.',
    synonyms: ['limit line', 'boundary curve'],
    subjectId: 'math',
  },
  {
    word: 'Catalyst',
    phonetic: 'ka-tə-ləst',
    partOfSpeech: 'noun',
    definition: 'A substance that speeds up a chemical reaction without being consumed by it.',
    example: 'Enzymes act as biological catalysts inside living cells.',
    synonyms: ['accelerant', 'trigger'],
    subjectId: 'chemistry',
  },
  {
    word: 'Homeostasis',
    phonetic: 'hō-mē-ō-stā-səs',
    partOfSpeech: 'noun',
    definition: 'The tendency of a living system to keep its internal conditions stable and balanced.',
    example: 'Sweating helps the body maintain homeostasis on a hot day.',
    synonyms: ['equilibrium', 'internal balance'],
    subjectId: 'biology',
  },
];

export const notifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Daily streak ready',
    body: 'Finish one lesson to extend your streak.',
    time: 'Now',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Quiz unlocked',
    body: 'A new mixed STEM quiz is ready.',
    time: '2h',
  },
  {
    id: 'n3',
    title: 'Study group',
    body: 'Maya shared notes in Physics.',
    time: 'Yesterday',
  },
];

export const seedUser: UserProfile = {
  displayName: 'Leon',
  handle: '@leonlearns',
  streak: 18,
  totalXp: 12480,
  completedLessons: 42,
  quizAverage: 86,
  history: [
    { label: 'M', xp: 120 },
    { label: 'T', xp: 220 },
    { label: 'W', xp: 90 },
    { label: 'T', xp: 280 },
    { label: 'F', xp: 180 },
    { label: 'S', xp: 320 },
    { label: 'S', xp: 140 },
  ],
};

export const starterMessages: ChatMessage[] = [
  {
    id: 'assistant-1',
    role: 'assistant',
    text: 'Ask me for a hint, a mini lesson, or a quiz recommendation. I can connect your question to Learnly lessons.',
  },
];
