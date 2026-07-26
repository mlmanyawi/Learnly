import React from 'react';
import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { subjectColor } from '@/utils/learnly';
import type { Subject, SubjectId } from '@/types';

export function ScreenShell({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();

  return <View style={[styles.screen, { backgroundColor: colors.bg }]}>{children}</View>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();

  return <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>{children}</View>;
}

export function PrimaryButton({ title, icon, ...props }: PressableProps & { title: string; icon?: React.ReactNode }) {
  const { colors } = useTheme();

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.primaryButton,
        {
          backgroundColor: colors.ember,
          opacity: pressed ? 0.82 : 1,
        },
      ]}
    >
      {icon}
      <Text style={styles.primaryText}>{title}</Text>
    </Pressable>
  );
}

export function IconButton({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      {children}
    </Pressable>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: string }) {
  const { colors } = useTheme();

  return (
    <View style={styles.sectionTitleRow}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {action ? <Text style={[styles.sectionAction, { color: colors.ember }]}>{action}</Text> : null}
    </View>
  );
}

export function ProgressBar({ value, color }: { value: number; color: string }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.progressTrack, { backgroundColor: colors.chip }]}> 
      <View style={[styles.progressFill, { backgroundColor: color, width: `${Math.max(4, value * 100)}%` }]} />
    </View>
  );
}

export function SubjectBadge({ subjectId, size = 48 }: { subjectId: SubjectId; size?: number }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.subjectBadge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: subjectColor(subjectId, colors),
        },
      ]}
    />
  );
}

export function SubjectCard({ subject, onPress }: { subject: Subject; onPress: () => void }) {
  const { colors } = useTheme();
  const Icon = subject.icon;
  const hue = subjectColor(subject.id, colors);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.subjectCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.82 : 1,
        },
      ]}
    >
      <View style={[styles.subjectIcon, { backgroundColor: `${hue}22` }]}>
        <Icon color={hue} size={24} />
      </View>
      <View style={styles.subjectTextWrap}>
        <Text style={[styles.subjectTitle, { color: colors.text }]}>{subject.title}</Text>
        <Text style={[styles.subjectSubtitle, { color: colors.textSoft }]}>{subject.subtitle}</Text>
        <ProgressBar value={subject.progress} color={hue} />
      </View>
      <ChevronRight color={colors.textFaint} size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 16,
    padding: 18,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  sectionAction: {
    fontSize: 13,
    fontWeight: '900',
  },
  progressTrack: {
    borderRadius: 99,
    height: 8,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 99,
    height: 8,
  },
  subjectBadge: {
    opacity: 0.95,
  },
  subjectCard: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
    padding: 14,
  },
  subjectIcon: {
    alignItems: 'center',
    borderRadius: 18,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  subjectTextWrap: {
    flex: 1,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  subjectSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
});
