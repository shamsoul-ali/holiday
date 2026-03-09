import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useTripStore } from '@/store';
import { islandPackages, mountainPackages, wildlifePackages, culturalPackages } from '@/data';

type MessageRole = 'user' | 'ai';

interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
  options?: QuickOption[];
  packageSuggestion?: boolean;
}

interface QuickOption {
  label: string;
  value: string;
  icon?: string;
}

// Simulated AI conversation tree
interface ConvoState {
  stage: 'greeting' | 'budget' | 'interest' | 'travelers' | 'duration' | 'suggesting' | 'confirmed';
  budget: number;
  interest: string;
  travelers: number;
  duration: string;
}

const budgetOptions: QuickOption[] = [
  { label: 'RM 500 - 1K', value: '750', icon: 'leaf' },
  { label: 'RM 1K - 3K', value: '2000', icon: 'sunny' },
  { label: 'RM 3K - 5K', value: '4000', icon: 'star' },
  { label: 'RM 5K+', value: '7500', icon: 'diamond' },
];

const interestOptions: QuickOption[] = [
  { label: 'Island & Diving', value: 'island', icon: 'water' },
  { label: 'Mountain & Trek', value: 'mountain', icon: 'trail-sign' },
  { label: 'Wildlife Safari', value: 'wildlife', icon: 'paw' },
  { label: 'Culture & Food', value: 'cultural', icon: 'restaurant' },
];

const travelerOptions: QuickOption[] = [
  { label: 'Solo trip', value: '1', icon: 'person' },
  { label: 'Couple', value: '2', icon: 'heart' },
  { label: 'Family (3-4)', value: '4', icon: 'people' },
  { label: 'Group (5+)', value: '6', icon: 'globe' },
];

const durationOptions: QuickOption[] = [
  { label: '2D1N Quick', value: '2d1n', icon: 'flash' },
  { label: '3D2N Weekend', value: '3d2n', icon: 'calendar' },
  { label: '4D3N Classic', value: '4d3n', icon: 'star' },
  { label: '5D4N+', value: '5d4n', icon: 'airplane' },
];

function getAIResponse(state: ConvoState, userInput: string): { text: string; options?: QuickOption[]; nextStage: ConvoState['stage'] } {
  switch (state.stage) {
    case 'greeting':
      return {
        text: `Nice to meet you! 🌊 I'm iBayu, your personal Sabah travel concierge.\n\nI'll help you plan the perfect trip — just like chatting with a local friend who knows all the best spots.\n\nFirst, what's your budget for this adventure?`,
        options: budgetOptions,
        nextStage: 'budget',
      };
    case 'budget':
      return {
        text: `Got it — ${getBudgetLabel(userInput)} is a great range! I already have some amazing ideas brewing 🤩\n\nWhat kind of experience are you looking for?`,
        options: interestOptions,
        nextStage: 'interest',
      };
    case 'interest':
      return {
        text: `${getInterestEmoji(userInput)} Excellent choice! ${getInterestHype(userInput)}\n\nHow many travelers are we planning for?`,
        options: travelerOptions,
        nextStage: 'travelers',
      };
    case 'travelers':
      return {
        text: `${getTravelerResponse(userInput)} How many days are you thinking?`,
        options: durationOptions,
        nextStage: 'duration',
      };
    case 'duration':
      return {
        text: getSuggestionText(state, userInput),
        nextStage: 'suggesting',
      };
    default:
      return { text: "Let me craft your perfect itinerary!", nextStage: 'confirmed' };
  }
}

function getBudgetLabel(val: string): string {
  const v = parseInt(val);
  if (v <= 750) return 'RM 500-1K';
  if (v <= 2000) return 'RM 1K-3K';
  if (v <= 4000) return 'RM 3K-5K';
  return 'RM 5K+';
}

function getInterestEmoji(val: string): string {
  const map: Record<string, string> = { island: '🏝️', mountain: '🏔️', wildlife: '🐒', cultural: '🎭' };
  return map[val] || '✨';
}

function getInterestHype(val: string): string {
  const map: Record<string, string> = {
    island: "Sabah has world-class islands — Sipadan is literally a top 5 dive site on the planet! Mabul and Kapalai are pure paradise.",
    mountain: "Mount Kinabalu is Southeast Asia's highest peak! The sunrise from the summit is unforgettable. Kundasang valley views are chef's kiss.",
    wildlife: "You're in for a treat! Kinabatangan River has proboscis monkeys, pygmy elephants, and orangutans all in one trip. Sepilok sanctuary is magical.",
    cultural: "Sabah's indigenous cultures are fascinating! Mari-Mari Cultural Village, plus the food scene in KK — Filipino market, night markets, fresh seafood...",
  };
  return map[val] || "Great choice for Sabah!";
}

function getTravelerResponse(val: string): string {
  const v = parseInt(val);
  if (v === 1) return "Solo adventure — love it! You'll have maximum flexibility. 🎒";
  if (v === 2) return "A trip for two — romantic! I'll find the best spots. 💕";
  if (v <= 4) return "Family trip! I'll make sure there's something for everyone. 👨‍👩‍👧‍👦";
  return "Group trip! The more the merrier — I'll find group-friendly options. 🎉";
}

function getSuggestionText(state: ConvoState, duration: string): string {
  const interest = state.interest;
  const budget = state.budget;
  const tierLabel = budget <= 1000 ? 'Budget-friendly' : budget <= 4000 ? 'Comfort' : 'Premium';

  const destMap: Record<string, string> = {
    island: 'Semporna → Sipadan → Mabul → Kapalai',
    mountain: 'KK → Kinabalu Park → Summit → Kundasang',
    wildlife: 'KK → Kinabatangan → Sepilok → Sandakan',
    cultural: 'KK → Mari-Mari → Food Tour → Tip of Borneo',
  };

  const highlights: Record<string, string> = {
    island: '• World-class diving/snorkeling at Sipadan\n• Overwater villa experience at Kapalai\n• Sea turtle encounters at Mabul\n• Fresh seafood at Semporna night market',
    mountain: '• Summit Mount Kinabalu at sunrise\n• Desa Dairy Farm in Kundasang\n• Poring Hot Springs & canopy walk\n• Sabah Tea Garden tour',
    wildlife: '• River cruise for proboscis monkeys\n• Orangutan feeding at Sepilok\n• Night safari for pygmy elephants\n• Rainforest canopy walkway',
    cultural: '• Traditional longhouse experience\n• Murut blowpipe & Kadazan dance\n• Filipino Market bargain shopping\n• KK night market food crawl',
  };

  return `Here's what I'm thinking for you:\n\n🗺️ ${destMap[interest] || 'Best of Sabah'}\n📅 ${duration.toUpperCase()}\n💰 ${tierLabel} tier (~RM ${budget.toLocaleString()}/pax)\n\n${highlights[interest] || ''}\n\nI've got 3 package options ready — Budget, Comfort, and Luxury. Want me to show you the full breakdown with pricing? 🚀`;
}

function getPackagesByInterest(interest: string) {
  const map: Record<string, typeof islandPackages> = {
    island: islandPackages,
    mountain: mountainPackages,
    wildlife: wildlifePackages,
    cultural: culturalPackages,
  };
  return map[interest] || islandPackages;
}

export default function IBayuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const { updateWizard, resetWizard } = useTripStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [convo, setConvo] = useState<ConvoState>({ stage: 'greeting', budget: 0, interest: '', travelers: 0, duration: '' });
  const [isTyping, setIsTyping] = useState(false);

  // Initial greeting
  useEffect(() => {
    resetWizard();
    const timer = setTimeout(() => {
      addAIMessage(
        "Halu! 👋 Welcome to iBayu — your intelligent Sabah travel concierge.\n\nTell me, what kind of Sabah adventure are you dreaming of? Or just say hi and I'll guide you through it!",
        [{ label: "Let's plan a trip!", value: 'start', icon: 'sparkles' }, { label: 'Surprise me!', value: 'surprise', icon: 'shuffle' }],
      );
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const addAIMessage = (text: string, options?: QuickOption[]) => {
    setMessages((prev) => [
      ...prev,
      { id: `ai-${Date.now()}`, role: 'ai', text, timestamp: new Date(), options },
    ]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', text, timestamp: new Date() },
    ]);
  };

  const simulateTyping = (callback: () => void) => {
    setIsTyping(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const handleOptionSelect = (option: QuickOption) => {
    addUserMessage(option.label);

    const newConvo = { ...convo };

    // Update state based on stage
    if (convo.stage === 'greeting') {
      if (option.value === 'surprise') {
        newConvo.budget = 3000;
        newConvo.interest = 'island';
        newConvo.travelers = 2;
        newConvo.duration = '4d3n';
        newConvo.stage = 'duration';
        simulateTyping(() => {
          addAIMessage("I love surprises! 🎲 Let me pick the best of Sabah for you...");
          setTimeout(() => {
            simulateTyping(() => {
              const text = getSuggestionText(newConvo, '4d3n');
              addAIMessage(text, [
                { label: "Show me packages! 🚀", value: 'confirm', icon: 'checkmark-circle' },
                { label: 'Change preferences', value: 'restart', icon: 'refresh' },
              ]);
              setConvo({ ...newConvo, stage: 'suggesting' });
            });
          }, 500);
        });
        return;
      }
      // "Let's plan" → go to budget
    }

    if (convo.stage === 'budget') {
      newConvo.budget = parseInt(option.value);
    } else if (convo.stage === 'interest') {
      newConvo.interest = option.value;
    } else if (convo.stage === 'travelers') {
      newConvo.travelers = parseInt(option.value);
    } else if (convo.stage === 'duration') {
      newConvo.duration = option.value;
    }

    if (convo.stage === 'suggesting') {
      if (option.value === 'confirm') {
        handleConfirmTrip(newConvo);
        return;
      }
      if (option.value === 'restart') {
        setConvo({ stage: 'greeting', budget: 0, interest: '', travelers: 0, duration: '' });
        simulateTyping(() => {
          addAIMessage("No problem! Let's start fresh. What's your budget?", budgetOptions);
          setConvo({ stage: 'greeting', budget: 0, interest: '', travelers: 0, duration: '' });
        });
        // Actually move to budget stage
        setTimeout(() => setConvo((c) => ({ ...c, stage: 'budget' })), 2500);
        return;
      }
    }

    const response = getAIResponse(convo, option.value);
    newConvo.stage = response.nextStage;
    setConvo(newConvo);

    simulateTyping(() => {
      const opts = response.nextStage === 'suggesting'
        ? [{ label: "Show me packages! 🚀", value: 'confirm', icon: 'checkmark-circle' }, { label: 'Change preferences', value: 'restart', icon: 'refresh' }]
        : response.options;
      addAIMessage(response.text, opts);
    });
  };

  const handleConfirmTrip = (state: ConvoState) => {
    addUserMessage("Show me packages! 🚀");
    simulateTyping(() => {
      addAIMessage("Perfect! Let me crunch the numbers and find you the best deals... 🔍✨\n\nPreparing 3 curated packages now!");

      // Set up trip store with chat selections
      updateWizard({
        budget: state.budget,
        adults: state.travelers || 2,
        interests: [state.interest],
        travelStyle: state.budget <= 1000 ? 'budget' : state.budget <= 4000 ? 'comfort' : 'luxury',
      });

      // Load the right packages into store
      const pkgs = getPackagesByInterest(state.interest);
      useTripStore.setState({ packages: pkgs });

      // Navigate to results after a beat
      setTimeout(() => {
        router.push('/(tabs)/explore/results');
      }, 1500);
    });
  };

  const handleSendText = () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');
    addUserMessage(text);

    // Simple keyword matching for free-text
    const lower = text.toLowerCase();
    if (convo.stage === 'greeting' || convo.stage === 'budget') {
      // Try to extract budget
      const budgetMatch = lower.match(/(\d[\d,]*)/);
      if (budgetMatch) {
        const val = parseInt(budgetMatch[1].replace(',', ''));
        if (val > 0) {
          const newConvo = { ...convo, budget: val, stage: 'interest' as const };
          setConvo(newConvo);
          simulateTyping(() => {
            addAIMessage(`RM ${val.toLocaleString()} — noted! 💰 What kind of experience are you after?`, interestOptions);
          });
          return;
        }
      }
    }

    // Keyword interest detection
    if (lower.includes('island') || lower.includes('div') || lower.includes('beach') || lower.includes('snorkel')) {
      handleAutoDetect('island', '🏝️ Sounds like you want islands & diving!');
      return;
    }
    if (lower.includes('mountain') || lower.includes('kinabalu') || lower.includes('hik') || lower.includes('trek')) {
      handleAutoDetect('mountain', '🏔️ Mountain adventure — great choice!');
      return;
    }
    if (lower.includes('wildlife') || lower.includes('animal') || lower.includes('orangutan') || lower.includes('monkey')) {
      handleAutoDetect('wildlife', '🐒 Wildlife safari it is!');
      return;
    }
    if (lower.includes('food') || lower.includes('cultur') || lower.includes('local')) {
      handleAutoDetect('cultural', '🎭 Culture & food lover!');
      return;
    }

    // Default: guide them
    simulateTyping(() => {
      addAIMessage(
        "I'd love to help! Let me guide you step by step so I can find the perfect trip. What's your budget range?",
        budgetOptions,
      );
      setConvo((c) => ({ ...c, stage: 'budget' }));
    });
  };

  const handleAutoDetect = (interest: string, response: string) => {
    const newConvo = { ...convo, interest };
    if (!newConvo.budget) newConvo.budget = 3000;
    newConvo.stage = 'travelers';
    setConvo(newConvo);
    simulateTyping(() => {
      addAIMessage(`${response}\n\nHow many travelers?`, travelerOptions);
    });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <LinearGradient colors={[...Colors.gradients.sabahSky]} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerAvatar}>
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>iBayu</Text>
              <Text style={styles.headerSub}>Intelligent Sabah Travel Concierge</Text>
            </View>
            <View style={styles.onlineDot} />
          </View>
        </LinearGradient>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, i) => (
            <Animated.View
              key={msg.id}
              entering={FadeInDown.delay(50).duration(300)}
              style={msg.role === 'user' ? styles.userRow : styles.aiRow}
            >
              {msg.role === 'ai' && (
                <View style={styles.aiAvatarSmall}>
                  <Ionicons name="sparkles" size={12} color={Colors.primary} />
                </View>
              )}
              <View style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.bubbleText, msg.role === 'user' && styles.userBubbleText]}>{msg.text}</Text>
              </View>
            </Animated.View>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <Animated.View entering={FadeInUp.duration(200)} style={styles.aiRow}>
              <View style={styles.aiAvatarSmall}>
                <Ionicons name="sparkles" size={12} color={Colors.primary} />
              </View>
              <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
                <View style={styles.typingDots}>
                  {[0, 1, 2].map((i) => (
                    <View key={i} style={[styles.typingDot, { opacity: 0.3 + i * 0.25 }]} />
                  ))}
                </View>
              </View>
            </Animated.View>
          )}

          {/* Quick options (from last AI message) */}
          {!isTyping && messages.length > 0 && messages[messages.length - 1].role === 'ai' && messages[messages.length - 1].options && (
            <Animated.View entering={FadeInUp.delay(200).duration(300)} style={styles.optionsContainer}>
              {messages[messages.length - 1].options!.map((opt) => (
                <TouchableOpacity key={opt.value} style={styles.optionChip} onPress={() => handleOptionSelect(opt)}>
                  {opt.icon && <Ionicons name={opt.icon as any} size={16} color={Colors.primary} />}
                  <Text style={styles.optionText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 80 }]}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={Colors.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSendText}
              returnKeyType="send"
              multiline={false}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              onPress={handleSendText}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={18} color={inputText.trim() ? '#FFFFFF' : Colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF' },
  headerSub: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)' },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4ADE80', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  messageList: { flex: 1 },
  messageContent: { padding: Spacing.base, paddingBottom: Spacing.xl },
  aiRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: Spacing.md, gap: Spacing.xs, maxWidth: '85%' },
  userRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: Spacing.md },
  aiAvatarSmall: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  bubble: { borderRadius: 18, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, maxWidth: '100%' },
  aiBubble: { backgroundColor: Colors.surface, borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: Colors.primary, borderBottomRightRadius: 4, maxWidth: '75%' },
  bubbleText: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.text, lineHeight: 22 },
  userBubbleText: { color: '#FFFFFF' },
  typingBubble: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
  typingDots: { flexDirection: 'row', gap: 4 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.xs, marginLeft: 28 },
  optionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary + '10', borderWidth: 1.5, borderColor: Colors.primary + '30',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full,
  },
  optionText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.primary },
  inputBar: { borderTopWidth: 1, borderTopColor: Colors.borderLight, backgroundColor: Colors.background, paddingHorizontal: Spacing.base, paddingTop: Spacing.sm },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  textInput: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.text,
    maxHeight: 40,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: Colors.surface },
});
