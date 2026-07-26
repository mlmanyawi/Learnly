import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, CheckCircle2, ListChecks } from 'lucide-react-native';
import { Card, IconButton, PrimaryButton, ScreenShell, SectionTitle } from '@/components/Core';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { quizzes } from '@/data/mockData';

export function QuizListScreen() {
  const { colors } = useTheme();
  const { openQuiz } = useApp();

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Quizzes</Text>
        <Text style={[styles.subtitle, { color: colors.textSoft }]}>Fast checks with instant explanations and XP rewards.</Text>
        <SectionTitle title="Recommended" />
        {quizzes.map((quiz) => (
          <Pressable key={quiz.id} onPress={() => openQuiz(quiz)}>
            <Card>
              <View style={styles.quizRow}>
                <View style={[styles.quizIcon, { backgroundColor: colors.emberSoft }]}> 
                  <ListChecks color={colors.ember} size={22} />
                </View>
                <View style={styles.quizText}>
                  <Text style={[styles.quizTitle, { color: colors.text }]}>{quiz.title}</Text>
                  <Text style={[styles.quizMeta, { color: colors.textSoft }]}>{quiz.difficulty} • {quiz.questions.length} questions • {quiz.xp} XP</Text>
                </View>
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}

export function QuizPlayerScreen() {
  const { colors } = useTheme();
  const { quiz, openQuiz, awardXp } = useApp();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  if (!quiz) {
    return null;
  }

  const question = quiz.questions[index];
  const answered = selected !== null;
  const isCorrect = selected === question.answerIndex;
  const isLast = index === quiz.questions.length - 1;

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <IconButton onPress={() => openQuiz(null)}>
            <ArrowLeft color={colors.textSoft} size={20} />
          </IconButton>
          <Text style={[styles.counter, { color: colors.textFaint }]}>{index + 1}/{quiz.questions.length}</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{quiz.title}</Text>
        <Card>
          <Text style={[styles.prompt, { color: colors.text }]}>{question.prompt}</Text>
          {question.choices.map((choice, choiceIndex) => {
            const picked = selected === choiceIndex;
            const correct = answered && choiceIndex === question.answerIndex;

            return (
              <Pressable
                key={choice}
                onPress={() => setSelected(choiceIndex)}
                style={[
                  styles.choice,
                  {
                    backgroundColor: picked || correct ? colors.emberSoft : colors.cardAlt,
                    borderColor: picked || correct ? colors.ember : colors.border,
                  },
                ]}
              >
                <Text style={[styles.choiceText, { color: colors.text }]}>{choice}</Text>
              </Pressable>
            );
          })}
          {answered ? (
            <Text style={[styles.explanation, { color: isCorrect ? colors.mint : colors.danger }]}>{question.explanation}</Text>
          ) : null}
        </Card>

        <PrimaryButton
          title={isLast ? 'Finish quiz' : 'Next question'}
          icon={<CheckCircle2 color="#FFFFFF" size={17} />}
          onPress={() => {
            if (!answered) {
              return;
            }

            const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);
            setCorrectCount(nextCorrectCount);

            if (isLast) {
              awardXp(Math.round(quiz.xp * (nextCorrectCount / quiz.questions.length)));
              openQuiz(null);
            } else {
              setIndex((current) => current + 1);
              setSelected(null);
            }
          }}
        />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 22,
    paddingBottom: 130,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 38,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 16,
    marginTop: 6,
  },
  quizRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  quizIcon: {
    alignItems: 'center',
    borderRadius: 18,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  quizText: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  quizMeta: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  counter: {
    fontSize: 13,
    fontWeight: '900',
  },
  prompt: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 30,
    marginBottom: 18,
  },
  choice: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
    padding: 15,
  },
  choiceText: {
    fontSize: 15,
    fontWeight: '800',
  },
  explanation: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 21,
    marginTop: 8,
  },
});
