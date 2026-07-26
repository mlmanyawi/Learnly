import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bell, BookMarked, Flame, Search, Star, TrendingUp } from 'lucide-react-native';
import { Card, IconButton, PrimaryButton, ScreenShell, SectionTitle, SubjectCard } from '@/components/Core';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { lessons, subjects, wordBank } from '@/data/mockData';
import { levelFromXp } from '@/utils/learnly';

export function HomeScreen() {
  const { colors } = useTheme();
  const {
    user,
    openSubject,
    openLesson,
    setDictionaryOpen,
    setNotificationsOpen,
    setSearchOpen,
  } = useApp();
  const level = levelFromXp(user.totalXp);
  const word = wordBank[0];
  const nextLesson = lessons[0];

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.kicker, { color: colors.ember }]}>LEARNLY</Text>
            <Text style={[styles.title, { color: colors.text }]}>Welcome back, {user.displayName}</Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton onPress={() => setSearchOpen(true)}>
              <Search color={colors.textSoft} size={20} />
            </IconButton>
            <IconButton onPress={() => setNotificationsOpen(true)}>
              <Bell color={colors.textSoft} size={20} />
            </IconButton>
          </View>
        </View>

        <Card style={styles.heroCard}>
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Flame color={colors.ember} size={18} />
              <Text style={[styles.statText, { color: colors.text }]}>{user.streak} day streak</Text>
            </View>
            <View style={styles.statPill}>
              <Star color={colors.gold} size={18} />
              <Text style={[styles.statText, { color: colors.text }]}>Level {level.level}</Text>
            </View>
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Keep your learning momentum.</Text>
          <Text style={[styles.heroBody, { color: colors.textSoft }]}>You are {level.intoLevel} XP into this level. Finish one lesson or quiz to keep the loop alive.</Text>
          <PrimaryButton title="Resume lesson" icon={<TrendingUp color="#FFFFFF" size={17} />} onPress={() => openLesson(nextLesson)} />
        </Card>

        <Card>
          <View style={styles.wordHeader}>
            <Text style={[styles.wordLabel, { color: colors.textFaint }]}>WORD OF THE DAY</Text>
            <BookMarked color={colors.ember} size={18} />
          </View>
          <Text style={[styles.word, { color: colors.text }]}>{word.word}</Text>
          <Text style={[styles.wordPhonetic, { color: colors.textFaint }]}>{word.phonetic} • {word.partOfSpeech}</Text>
          <Text style={[styles.wordDefinition, { color: colors.textSoft }]}>{word.definition}</Text>
          <PrimaryButton title="Open dictionary" onPress={() => setDictionaryOpen(true)} />
        </Card>

        <SectionTitle title="Subjects" action="Personalized" />
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} onPress={() => openSubject(subject)} />
        ))}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 22,
    paddingBottom: 130,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 38,
    marginBottom: 18,
    marginTop: 4,
    maxWidth: 265,
  },
  heroCard: {
    overflow: 'hidden',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statPill: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: '900',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 6,
  },
  heroBody: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
    marginBottom: 16,
  },
  wordHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wordLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  word: {
    fontSize: 30,
    fontWeight: '900',
    marginTop: 8,
  },
  wordPhonetic: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 2,
  },
  wordDefinition: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 16,
  },
});
