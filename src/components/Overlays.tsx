import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Bell, BookMarked, Search, X } from 'lucide-react-native';
import { Card, IconButton, PrimaryButton, SubjectBadge } from '@/components/Core';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { lessons, notifications, subjects, wordBank } from '@/data/mockData';

function Sheet({ visible, children, onClose }: { visible: boolean; children: React.ReactNode; onClose: () => void }) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.scrim}>
        <View style={[styles.sheet, { backgroundColor: colors.bg }]}> 
          <View style={styles.closeRow}>
            <IconButton onPress={onClose}>
              <X color={colors.textSoft} size={20} />
            </IconButton>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

export function SearchOverlay() {
  const { colors } = useTheme();
  const { searchOpen, setSearchOpen, openLesson, openSubject } = useApp();

  return (
    <Sheet visible={searchOpen} onClose={() => setSearchOpen(false)}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Search</Text>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <Search color={colors.textFaint} size={18} />
          <TextInput
            placeholder="Search lessons, subjects, terms"
            placeholderTextColor={colors.textFaint}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
        {subjects.map((subject) => (
          <Pressable
            key={subject.id}
            onPress={() => {
              openSubject(subject);
              setSearchOpen(false);
            }}
          >
            <Card>
              <View style={styles.row}>
                <SubjectBadge subjectId={subject.id} size={36} />
                <View style={styles.fill}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{subject.title}</Text>
                  <Text style={[styles.itemSub, { color: colors.textSoft }]}>{subject.summary}</Text>
                </View>
              </View>
            </Card>
          </Pressable>
        ))}
        {lessons.map((lesson) => (
          <Pressable
            key={lesson.id}
            onPress={() => {
              openLesson(lesson);
              setSearchOpen(false);
            }}
          >
            <Card>
              <Text style={[styles.itemTitle, { color: colors.text }]}>{lesson.title}</Text>
              <Text style={[styles.itemSub, { color: colors.textSoft }]}>{lesson.subtitle}</Text>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </Sheet>
  );
}

export function NotificationsOverlay() {
  const { colors } = useTheme();
  const { notificationsOpen, setNotificationsOpen } = useApp();

  return (
    <Sheet visible={notificationsOpen} onClose={() => setNotificationsOpen(false)}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
        {notifications.map((item) => (
          <Card key={item.id}>
            <View style={styles.row}>
              <Bell color={item.unread ? colors.ember : colors.textFaint} size={22} />
              <View style={styles.fill}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.itemSub, { color: colors.textSoft }]}>{item.body}</Text>
              </View>
              <Text style={[styles.time, { color: colors.textFaint }]}>{item.time}</Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </Sheet>
  );
}

export function DictionaryOverlay() {
  const { colors } = useTheme();
  const { dictionaryOpen, setDictionaryOpen } = useApp();

  return (
    <Sheet visible={dictionaryOpen} onClose={() => setDictionaryOpen(false)}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Dictionary</Text>
        {wordBank.map((entry) => (
          <Card key={entry.word}>
            <View style={styles.row}>
              <BookMarked color={colors.ember} size={22} />
              <View style={styles.fill}>
                <Text style={[styles.word, { color: colors.text }]}>{entry.word}</Text>
                <Text style={[styles.itemSub, { color: colors.textFaint }]}>{entry.phonetic} • {entry.partOfSpeech}</Text>
              </View>
            </View>
            <Text style={[styles.definition, { color: colors.textSoft }]}>{entry.definition}</Text>
            <Text style={[styles.example, { color: colors.textFaint }]}>“{entry.example}”</Text>
            <View style={styles.synonymRow}>
              {entry.synonyms.map((synonym) => (
                <Text key={synonym} style={[styles.synonym, { backgroundColor: colors.chip, color: colors.textSoft }]}>{synonym}</Text>
              ))}
            </View>
          </Card>
        ))}
        <PrimaryButton title="Close dictionary" onPress={() => setDictionaryOpen(false)} />
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  scrim: {
    backgroundColor: 'rgba(0,0,0,0.42)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    maxHeight: '88%',
    minHeight: '58%',
  },
  closeRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  content: {
    padding: 22,
    paddingBottom: 44,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 16,
  },
  searchBox: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    padding: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  fill: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  itemSub: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 3,
  },
  time: {
    fontSize: 12,
    fontWeight: '900',
  },
  word: {
    fontSize: 22,
    fontWeight: '900',
  },
  definition: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 23,
    marginTop: 14,
  },
  example: {
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 10,
  },
  synonymRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  synonym: {
    borderRadius: 99,
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
});
