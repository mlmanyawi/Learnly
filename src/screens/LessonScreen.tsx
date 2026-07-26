import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Card, IconButton, PrimaryButton, ScreenShell } from '@/components/Core';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { subjectColor } from '@/utils/learnly';

export function LessonScreen() {
  const { colors } = useTheme();
  const { lesson, subject, openLesson, awardXp } = useApp();
  const [index, setIndex] = useState(0);

  if (!lesson) {
    return null;
  }

  const block = lesson.sections[index];
  const hue = subject ? subjectColor(subject.id, colors) : colors.ember;
  const isLast = index === lesson.sections.length - 1;

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <IconButton onPress={() => openLesson(null)}>
            <ArrowLeft color={colors.textSoft} size={20} />
          </IconButton>
          <Text style={[styles.counter, { color: colors.textFaint }]}>{index + 1}/{lesson.sections.length}</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{lesson.title}</Text>
        <Text style={[styles.subtitle, { color: colors.textSoft }]}>{lesson.subtitle}</Text>

        <Card style={styles.blockCard}>
          <View style={[styles.kindPill, { backgroundColor: `${hue}22` }]}> 
            <Text style={[styles.kindText, { color: hue }]}>{block.kind.toUpperCase()}</Text>
          </View>
          <Text style={[styles.blockTitle, { color: colors.text }]}>{block.title}</Text>
          <Text style={[styles.blockBody, { color: colors.textSoft }]}>{block.body}</Text>
        </Card>

        <View style={styles.navRow}>
          <PrimaryButton
            title="Back"
            icon={<ChevronLeft color="#FFFFFF" size={17} />}
            disabled={index === 0}
            onPress={() => setIndex((current) => Math.max(0, current - 1))}
          />
          <PrimaryButton
            title={isLast ? 'Complete' : 'Next'}
            icon={isLast ? <CheckCircle2 color="#FFFFFF" size={17} /> : <ChevronRight color="#FFFFFF" size={17} />}
            onPress={() => {
              if (isLast) {
                awardXp(lesson.xp);
                openLesson(null);
              } else {
                setIndex((current) => current + 1);
              }
            }}
          />
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 22,
    paddingBottom: 130,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  counter: {
    fontSize: 13,
    fontWeight: '900',
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 18,
    marginTop: 6,
  },
  blockCard: {
    minHeight: 320,
  },
  kindPill: {
    alignSelf: 'flex-start',
    borderRadius: 99,
    marginBottom: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  kindText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  blockTitle: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 12,
  },
  blockBody: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 28,
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
});
