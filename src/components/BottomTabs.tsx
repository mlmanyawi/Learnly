import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bot, Home, ListChecks, User } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import type { TabId } from '@/types';

const tabs = [
  { id: 'learn' as TabId, label: 'Learn', icon: Home },
  { id: 'quiz' as TabId, label: 'Quiz', icon: ListChecks },
  { id: 'chat' as TabId, label: 'Chat', icon: Bot },
  { id: 'profile' as TabId, label: 'Profile', icon: User },
];

export function BottomTabs() {
  const { tab, setTab, openLesson, openQuiz, openSubject } = useApp();
  const { colors } = useTheme();

  return (
    <View style={[styles.wrap, { backgroundColor: colors.card, borderColor: colors.border }]}> 
      {tabs.map((item) => {
        const Icon = item.icon;
        const active = tab === item.id;

        return (
          <Pressable
            key={item.id}
            onPress={() => {
              openLesson(null);
              openQuiz(null);
              openSubject(null);
              setTab(item.id);
            }}
            style={[styles.tab, { backgroundColor: active ? colors.emberSoft : 'transparent' }]}
          >
            <Icon color={active ? colors.ember : colors.textFaint} size={20} />
            <Text style={[styles.label, { color: active ? colors.ember : colors.textFaint }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    borderRadius: 28,
    borderWidth: 1,
    bottom: 18,
    flexDirection: 'row',
    gap: 4,
    padding: 8,
    position: 'absolute',
  },
  tab: {
    alignItems: 'center',
    borderRadius: 20,
    minWidth: 70,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 3,
  },
});
