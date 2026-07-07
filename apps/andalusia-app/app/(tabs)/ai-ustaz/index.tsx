import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useUmrahStore } from '@/store';
import { Chip } from '@/components/ui';

interface Message {
  id: string;
  type: 'bot' | 'user';
  text: string;
  options?: { label: string; value: string }[];
}

const initialMessages: Message[] = [
  {
    id: '1',
    type: 'bot',
    text: 'Assalamualaikum! Saya AI Ustaz Andalusia. Saya boleh bantu anda merancang perjalanan umrah yang sempurna. Berapa bajet anda?',
    options: [
      { label: 'RM5-7K', value: 'ekonomi' },
      { label: 'RM7-9K', value: 'standard' },
      { label: 'RM9-11K', value: 'premium' },
      { label: 'RM11K+', value: 'vip' },
    ],
  },
];

const flowSteps: Record<string, Message> = {
  budget_selected: {
    id: '2',
    type: 'bot',
    text: 'Pilihan bagus! Apakah jenis pakej yang anda minati?',
    options: [
      { label: 'Umrah Standard', value: 'standard' },
      { label: 'Umrah Premium', value: 'premium' },
      { label: 'Plus Istanbul', value: 'plus-istanbul' },
      { label: 'Plus Dubai', value: 'plus-dubai' },
    ],
  },
  interest_selected: {
    id: '3',
    type: 'bot',
    text: 'Berapa ramai yang akan pergi?',
    options: [
      { label: 'Sendiri', value: '1' },
      { label: 'Pasangan', value: '2' },
      { label: 'Keluarga (3-5)', value: '4' },
      { label: 'Rombongan (6+)', value: '8' },
    ],
  },
  travelers_selected: {
    id: '4',
    type: 'bot',
    text: 'Berapa lama perjalanan yang anda ingini?',
    options: [
      { label: '10 Hari', value: '10' },
      { label: '12 Hari', value: '12' },
      { label: '14 Hari Plus', value: '14' },
    ],
  },
  duration_selected: {
    id: '5',
    type: 'bot',
    text: 'Jazakallahu khairan! Saya telah menyediakan beberapa pakej yang sesuai untuk anda. Tekan butang di bawah untuk melihat pilihan.',
    options: [
      { label: 'Lihat Pakej Disyorkan', value: 'view_results' },
    ],
  },
};

const ritualAnswers: Record<string, string> = {
  tawaf: 'Tawaf adalah mengelilingi Kaabah sebanyak 7 pusingan bermula dari Hajar Aswad. Setiap pusingan dimulai dengan mengangkat tangan kanan ke arah Hajar Aswad sambil membaca "Bismillahi Wallahu Akbar". Kekalkan khusyuk dan banyakkan berdoa.',
  saie: 'Saie adalah berjalan 7 kali antara Bukit Safa dan Marwah. Dimulakan dari Safa, dan setiap perjalanan dari satu bukit ke bukit lain dikira satu kali. Lelaki digalakkan berlari-lari anak di antara tanda hijau.',
  ihram: 'Ihram bermula di Miqat. Lelaki memakai 2 helai kain putih tanpa jahitan. Perempuan berpakaian biasa yang menutup aurat. Selepas niat, baca talbiyah: "Labbaikallahumma labbaik..."',
};

export default function AIUstazScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const { updateWizard, generatePackages } = useUmrahStore();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [currentStep, setCurrentStep] = useState('initial');
  const [inputText, setInputText] = useState('');

  const addMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleOption = (option: { label: string; value: string }) => {
    addMessage({ id: `user-${Date.now()}`, type: 'user', text: option.label });

    if (option.value === 'view_results') {
      router.push('/(tabs)/umrah/loading');
      generatePackages().then(() => {
        router.replace('/(tabs)/umrah/results');
      });
      return;
    }

    let nextStep = '';
    if (currentStep === 'initial') nextStep = 'budget_selected';
    else if (currentStep === 'budget_selected') nextStep = 'interest_selected';
    else if (currentStep === 'interest_selected') nextStep = 'travelers_selected';
    else if (currentStep === 'travelers_selected') nextStep = 'duration_selected';

    if (nextStep && flowSteps[nextStep]) {
      setTimeout(() => {
        addMessage(flowSteps[nextStep]);
        setCurrentStep(nextStep);
      }, 500);
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const text = inputText.toLowerCase();
    addMessage({ id: `user-${Date.now()}`, type: 'user', text: inputText });
    setInputText('');

    let answer = 'Terima kasih atas soalan anda. Untuk maklumat lanjut tentang ibadah umrah, sila lawati tab Ibadah atau hubungi mutawif kami.';
    if (text.includes('tawaf')) answer = ritualAnswers.tawaf;
    else if (text.includes('saie') || text.includes('sa\'i')) answer = ritualAnswers.saie;
    else if (text.includes('ihram')) answer = ritualAnswers.ihram;

    setTimeout(() => {
      addMessage({ id: `bot-${Date.now()}`, type: 'bot', text: answer });
    }, 800);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#059669', '#10B981']} style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerContent}>
          <View style={styles.avatarCircle}>
            <Ionicons name="sparkles" size={24} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Ustaz</Text>
            <Text style={styles.headerSubtitle}>Pembantu Umrah Pintar</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, index) => (
          <Animated.View
            key={msg.id}
            entering={FadeInUp.delay(index === messages.length - 1 ? 200 : 0).duration(400)}
            style={[styles.messageBubble, msg.type === 'user' ? styles.userBubble : styles.botBubble]}
          >
            {msg.type === 'bot' && (
              <View style={styles.botAvatar}>
                <Ionicons name="sparkles" size={14} color={Colors.primary} />
              </View>
            )}
            <View style={[styles.bubbleContent, msg.type === 'user' ? styles.userContent : styles.botContent]}>
              <Text style={[styles.messageText, msg.type === 'user' && styles.userText]}>{msg.text}</Text>
              {msg.options && (
                <View style={styles.options}>
                  {msg.options.map((opt) => (
                    <TouchableOpacity key={opt.value} style={styles.optionBtn} onPress={() => handleOption(opt)}>
                      <Text style={styles.optionText}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <TextInput
          style={styles.input}
          placeholder="Tanya soalan tentang umrah..."
          placeholderTextColor={Colors.textTertiary}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.lg },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF' },
  headerSubtitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)' },

  chatContent: { padding: Spacing.base, paddingBottom: 20 },
  messageBubble: { flexDirection: 'row', marginBottom: Spacing.md, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end' },
  botBubble: { alignSelf: 'flex-start' },
  botAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm, marginTop: 4 },
  bubbleContent: { borderRadius: BorderRadius.lg, padding: Spacing.md, maxWidth: '100%' },
  userContent: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  botContent: { backgroundColor: Colors.surface, borderBottomLeftRadius: 4 },
  messageText: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.text, lineHeight: 22 },
  userText: { color: '#FFFFFF' },

  options: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  optionBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  optionText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.primary },

  inputBar: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, borderTopWidth: 1, borderTopColor: Colors.borderLight, gap: Spacing.sm },
  input: { flex: 1, height: 44, borderRadius: 22, backgroundColor: Colors.surface, paddingHorizontal: Spacing.base, fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.text },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
});
