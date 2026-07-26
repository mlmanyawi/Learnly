import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BottomTabs } from '@/components/BottomTabs';
import { DictionaryOverlay, NotificationsOverlay, SearchOverlay } from '@/components/Overlays';
import { AppProvider, useApp } from '@/context/AppContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { ChatScreen, ProfileScreen, SettingsScreen } from '@/screens/ChatProfileSettings';
import { HomeScreen } from '@/screens/HomeScreen';
import { LessonScreen } from '@/screens/LessonScreen';
import { QuizListScreen, QuizPlayerScreen } from '@/screens/QuizScreens';
import { SubjectScreen } from '@/screens/SubjectScreen';

function Router() {
  const { colors, mode } = useTheme();
  const { tab, subject, lesson, quiz, settingsOpen } = useApp();

  let content = <HomeScreen />;

  if (settingsOpen) {
    content = <SettingsScreen />;
  } else if (quiz) {
    content = <QuizPlayerScreen />;
  } else if (lesson) {
    content = <LessonScreen />;
  } else if (subject) {
    content = <SubjectScreen />;
  } else if (tab === 'quiz') {
    content = <QuizListScreen />;
  } else if (tab === 'chat') {
    content = <ChatScreen />;
  } else if (tab === 'profile') {
    content = <ProfileScreen />;
  }

  const showTabs = !settingsOpen && !quiz && !lesson && !subject;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}> 
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      {content}
      {showTabs ? <BottomTabs /> : null}
      <SearchOverlay />
      <NotificationsOverlay />
      <DictionaryOverlay />
    </SafeAreaView>
  );
}

export function LearnlyApp() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router />
      </AppProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
});
