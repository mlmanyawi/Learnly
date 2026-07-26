import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, BookOpen, Check, Play } from 'lucide-react-native';
import { Card, IconButton, PrimaryButton, ScreenShell, SectionTitle } from '@/components/Core';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { lessons, quizzes } from '@/data/mockData';
import { subjectColor } from '@/utils/learnly';

export function SubjectScreen() {
  const { colors } = useTheme();
  const { subject, openSubject, openLesson, openQuiz } = useApp();

  if (!subject) {
    return null;
  }

  const Icon = subject.icon;
  const hue = subjectColor(subject.id, colors);
  const subjectLessons = lessons.filter((lesson) => lesson.subjectId === subject.id);
  const subjectQuiz = quizzes.find((quiz) => quiz.subjectId === subject.id) ?? quizzes[0];

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <IconButton onPress={() => openSubject(null)}>
          <ArrowLeft color={colors.textSoft} size={20} />
        </IconButton>

        <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <View style={[styles.heroIcon, { backgroundColor: `${hue}22` }]}> 
            <Icon color={hue} size={42} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{subject.title}</Text>
          <Text style={[styles.summary, { color: colors.textSoft }]}>{subject.summary}</Text>
          <PrimaryButton title="Start subject quiz" icon={<Play color="#FFFFFF" size={17} />} onPress={() => openQuiz(subjectQuiz)} />
        </View>

        <SectionTitle title="Learning path" action={`${subjectLessons.length} lessons`} />
        {subjectLessons.map((lesson, index) => (
          <Pressable key={lesson.id} onPress={() => openLesson(lesson)}>
            <Card>
              <View style={styles.lessonRow}>
                <View style={[styles.lessonNumber, { backgroundColor: `${hue}22` }]}> 
                  <Text style={[styles.lessonNumberText, { color: hue }]}>{index + 1}</Text>
                </View>
                <View style={styles.lessonText}>
                  <Text style={[styles.lessonTitle, { color: colors.text }]}>{lesson.title}</Text>
                  <Text style={[styles.lessonMeta, { color: colors.textSoft }]}>{lesson.duration} • {lesson.xp} XP</Text>
                </View>
                {index === 0 ? <Check color={colors.mint} size={20} /> : <BookOpen color={colors.textFaint} size={20} />}
              </View>
            </Card>
          </Pressable>
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
  hero: {
    borderRadius: 32,
    borderWidth: 1,
    marginBottom: 18,
    marginTop: 16,
    padding: 22,
  },
  heroIcon: {
    alignItems: 'center',
    borderRadius: 28,
    height: 72,
    justifyContent: 'center',
    marginBottom: 14,
    width: 72,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 40,
  },
  summary: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 18,
    marginTop: 8,
  },
  lessonRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  lessonNumber: {
    alignItems: 'center',
    borderRadius: 18,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  lessonNumberText: {
    fontSize: 16,
    fontWeight: '900',
  },
  lessonText: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  lessonMeta: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
});
