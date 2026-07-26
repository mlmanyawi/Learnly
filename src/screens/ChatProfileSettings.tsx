import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Bot, Flame, Moon, Palette, Send, Settings, Trophy, User } from 'lucide-react-native';
import { Card, PrimaryButton, ScreenShell, SectionTitle } from '@/components/Core';
import { accents } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { starterMessages } from '@/data/mockData';
import { createAssistantReply, levelFromXp } from '@/utils/learnly';
import type { AccentId, ChatMessage } from '@/types';

export function ChatScreen() {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [draft, setDraft] = useState('');

  function sendMessage() {
    const clean = draft.trim();

    if (!clean) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: clean,
    };
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      text: createAssistantReply(clean),
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setDraft('');
  }

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Tutor chat</Text>
        <Text style={[styles.subtitle, { color: colors.textSoft }]}>A lightweight on-device tutor experience with Learnly-style hints.</Text>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.message,
              {
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: message.role === 'user' ? colors.ember : colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.messageText, { color: message.role === 'user' ? '#FFFFFF' : colors.text }]}>{message.text}</Text>
          </View>
        ))}
        <View style={[styles.composer, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Ask for a hint..."
            placeholderTextColor={colors.textFaint}
            style={[styles.input, { color: colors.text }]}
          />
          <Pressable onPress={sendMessage} style={[styles.sendButton, { backgroundColor: colors.ember }]}> 
            <Send color="#FFFFFF" size={18} />
          </Pressable>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

export function ProfileScreen() {
  const { colors } = useTheme();
  const { user, setSettingsOpen } = useApp();
  const level = levelFromXp(user.totalXp);

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        <Card>
          <View style={[styles.avatar, { backgroundColor: colors.ember }]}> 
            <User color="#FFFFFF" size={36} />
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{user.displayName}</Text>
          <Text style={[styles.subtitle, { color: colors.textSoft }]}>{user.handle}</Text>
          <PrimaryButton title="Open settings" icon={<Settings color="#FFFFFF" size={17} />} onPress={() => setSettingsOpen(true)} />
        </Card>
        <SectionTitle title="Stats" />
        <View style={styles.statGrid}>
          <Card style={styles.statCard}>
            <Flame color={colors.ember} size={22} />
            <Text style={[styles.statValue, { color: colors.text }]}>{user.streak}</Text>
            <Text style={[styles.statLabel, { color: colors.textSoft }]}>Day streak</Text>
          </Card>
          <Card style={styles.statCard}>
            <Trophy color={colors.gold} size={22} />
            <Text style={[styles.statValue, { color: colors.text }]}>Level {level.level}</Text>
            <Text style={[styles.statLabel, { color: colors.textSoft }]}>{user.totalXp} XP</Text>
          </Card>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

export function SettingsScreen() {
  const { colors, mode, toggleMode, accent, setAccent } = useTheme();
  const { user, renameUser, setSettingsOpen } = useApp();
  const [name, setName] = useState(user.displayName);

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <Card>
          <Text style={[styles.fieldLabel, { color: colors.textFaint }]}>DISPLAY NAME</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={[styles.nameInput, { color: colors.text, borderColor: colors.border }]}
          />
          <PrimaryButton
            title="Save profile"
            onPress={() => {
              renameUser(name);
              setSettingsOpen(false);
            }}
          />
        </Card>
        <Card>
          <View style={styles.settingRow}>
            <Moon color={colors.ember} size={22} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Dark mode</Text>
              <Text style={[styles.settingSub, { color: colors.textSoft }]}>Switch between Ink and Paper palettes.</Text>
            </View>
            <Switch value={mode === 'dark'} onValueChange={toggleMode} />
          </View>
        </Card>
        <SectionTitle title="Accent" />
        {Object.entries(accents).map(([id, value]) => (
          <Pressable key={id} onPress={() => setAccent(id as AccentId)}>
            <Card>
              <View style={styles.settingRow}>
                <Palette color={id === accent ? colors.ember : colors.textFaint} size={22} />
                <Text style={[styles.settingTitle, { color: id === accent ? colors.ember : colors.text }]}>{value.label}</Text>
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
  message: {
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 10,
    maxWidth: '86%',
    padding: 14,
  },
  messageText: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  composer: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    padding: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    padding: 8,
  },
  sendButton: {
    alignItems: 'center',
    borderRadius: 18,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 44,
    height: 88,
    justifyContent: 'center',
    marginBottom: 14,
    width: 88,
  },
  name: {
    fontSize: 28,
    fontWeight: '900',
  },
  statGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
  },
  nameInput: {
    borderBottomWidth: 1,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 18,
    paddingBottom: 8,
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  settingSub: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 3,
  },
});
