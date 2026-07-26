import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { seedUser } from '@/data/mockData';
import type { Lesson, Quiz, Subject, TabId, UserProfile } from '@/types';

interface AppContextValue {
  tab: TabId;
  setTab: (tab: TabId) => void;
  subject: Subject | null;
  openSubject: (subject: Subject | null) => void;
  lesson: Lesson | null;
  openLesson: (lesson: Lesson | null) => void;
  quiz: Quiz | null;
  openQuiz: (quiz: Quiz | null) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  dictionaryOpen: boolean;
  setDictionaryOpen: (open: boolean) => void;
  user: UserProfile;
  awardXp: (xp: number) => void;
  renameUser: (name: string) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<TabId>('learn');
  const [subject, openSubject] = useState<Subject | null>(null);
  const [lesson, openLesson] = useState<Lesson | null>(null);
  const [quiz, openQuiz] = useState<Quiz | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dictionaryOpen, setDictionaryOpen] = useState(false);
  const [user, setUser] = useState<UserProfile>(seedUser);

  const value = useMemo(
    () => ({
      tab,
      setTab,
      subject,
      openSubject,
      lesson,
      openLesson,
      quiz,
      openQuiz,
      settingsOpen,
      setSettingsOpen,
      searchOpen,
      setSearchOpen,
      notificationsOpen,
      setNotificationsOpen,
      dictionaryOpen,
      setDictionaryOpen,
      user,
      awardXp: (xp: number) => {
        setUser((current) => ({
          ...current,
          totalXp: current.totalXp + xp,
          completedLessons: current.completedLessons + 1,
          history: current.history.map((day, index) => (
            index === current.history.length - 1 ? { ...day, xp: day.xp + xp } : day
          )),
        }));
      },
      renameUser: (displayName: string) => {
        setUser((current) => ({
          ...current,
          displayName,
        }));
      },
    }),
    [dictionaryOpen, lesson, notificationsOpen, quiz, searchOpen, settingsOpen, subject, tab, user],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }

  return context;
}
