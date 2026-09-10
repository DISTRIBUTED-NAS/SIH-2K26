import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ScreenWrapper, AppCard, PrimaryButton } from '../../shared/components';
import { colors, spacing, typography } from '../../core/theme';
import { useAuth } from '../auth/context/AuthContext';
import { inspectionService } from '../inspections/services/inspectionService';
import { AI_SERVICE_URL } from '../../core/config';

const QUICK_PROMPTS = [
  'How many pending cases do I have today?',
  'What is my current duty workload status?',
  'What is MPE for 30kg Class III scale?',
  'Explain Section 24 verification rules',
];

export const LMOAssistantScreen = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'USER' | 'AI'; text: string; model?: string }>>([
    {
      sender: 'AI',
      text: `Greetings, ${user?.fullName || 'Officer Jane Doe'}! I am your personalized ScaleGuard LMO Duty Companion & Legal Metrology AI Assistant. You can ask me about your pending/completed cases, assigned duty workload, or statutory Legal Metrology rules & tolerances.`,
      model: 'ScaleGuard Duty & Legal Companion v2.0',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    inspectionService.getTodaySummary()
      .then(s => setSummary(s))
      .catch(() => {});
  }, []);

  const handleSendQuery = async (userQueryText?: string) => {
    const textToSend = userQueryText || query.trim();
    if (!textToSend || isLoading) return;

    const newMessages = [...messages, { sender: 'USER' as const, text: textToSend }];
    setMessages(newMessages);
    if (!userQueryText) setQuery('');
    setIsLoading(true);

    const officerContext = {
      officerName: user?.fullName || 'Jane Doe',
      officerId: user?.id || 'OFFICER001',
      circle: 'Andhra Pradesh Circle',
      assigned: summary?.assigned || 4,
      pending: summary?.pending || 2,
      inProgress: summary?.inProgress || 1,
      completed: summary?.completed || 1,
    };

    try {
      const response = await fetch(`${AI_SERVICE_URL}/llm/assistant-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend, officerContext }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([
          ...newMessages,
          {
            sender: 'AI',
            text: data.answer || 'No answer generated.',
            model: `${data.modelUsed || 'Local LLM'} (${data.source || 'Offline'})`,
          },
        ]);
      } else {
        throw new Error('LLM Assistant response error');
      }
    } catch (error) {
      // Local Fallback with personalized officer context
      const offName = user?.fullName || 'Officer Jane Doe';
      const p = summary?.pending ?? 2;
      const c = summary?.completed ?? 1;
      const tot = summary?.assigned ?? 4;

      let fallbackText = `Statutory Guidance for "${textToSend}":\n\nAll weighing and measuring instruments deployed for commercial transactions must hold a valid Type Approval Certificate, undergo annual verification under Section 24 of the Legal Metrology Act 2009, and display an intact lead seal with the LMO verification mark.`;

      if (textToSend.toLowerCase().includes('pending') || textToSend.toLowerCase().includes('case') || textToSend.toLowerCase().includes('status') || textToSend.toLowerCase().includes('how many')) {
        fallbackText = `Greetings ${offName}! Here is your personalized Live Duty Summary:\n\n📊 Total Assigned Cases Today: ${tot}\n⏳ Pending Inspections: ${p}\n🔄 In-Progress Inspections: ${summary?.inProgress ?? 1}\n✅ Completed & Certified: ${c}\n\nYou currently have ${p} pending inspection(s) remaining for today.`;
      }

      setMessages([
        ...newMessages,
        {
          sender: 'AI',
          text: fallbackText,
          model: 'Offline Metrology Duty Engine',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PERSONALIZED LMO DUTY COMPANION</Text>
          </View>
          <Text style={styles.title}>Legal Metrology Advisor</Text>
          <Text style={styles.subtitle}>
            Ask about your live pending/completed cases or statutory Legal Metrology rules & tolerances.
          </Text>
        </View>

        {/* Quick Prompts */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickPromptScroll}>
          {QUICK_PROMPTS.map((p, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.quickPromptChip}
              onPress={() => handleSendQuery(p)}
              disabled={isLoading}
            >
              <Text style={styles.quickPromptText}>💡 {p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Messages List */}
        <ScrollView style={styles.chatContainer} contentContainerStyle={styles.chatContent}>
          {messages.map((m, idx) => (
            <View
              key={idx}
              style={[
                styles.messageBubble,
                m.sender === 'USER' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <View style={styles.senderHeader}>
                <Text style={styles.senderName}>{m.sender === 'USER' ? `👨‍⚖️ ${user?.fullName || 'LMO Officer'}` : '🤖 ScaleGuard AI'}</Text>
                {m.model && <Text style={styles.modelTag}>{m.model}</Text>}
              </View>
              <Text style={m.sender === 'USER' ? styles.userText : styles.aiText}>{m.text}</Text>
            </View>
          ))}
          {isLoading && (
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Analyzing officer context & legal rules...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask about your pending cases or legal rules..."
            placeholderTextColor={colors.text.secondary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSendQuery()}
          />
          <TouchableOpacity
            style={[styles.sendButton, !query.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSendQuery()}
            disabled={!query.trim() || isLoading}
          >
            <Text style={styles.sendIcon}>➔</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.xs,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(15, 58, 102, 0.08)',
    borderColor: 'rgba(15, 58, 102, 0.2)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.6,
  },
  title: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: 2,
  },
  quickPromptScroll: {
    maxHeight: 40,
    marginVertical: spacing.xs,
  },
  quickPromptChip: {
    backgroundColor: '#EBF2FA',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  quickPromptText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  chatContainer: {
    flex: 1,
    marginVertical: spacing.xs,
  },
  chatContent: {
    paddingBottom: spacing.md,
  },
  messageBubble: {
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  userBubble: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
    maxWidth: '88%',
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
    maxWidth: '92%',
  },
  senderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
  },
  modelTag: {
    fontSize: 9,
    color: colors.text.muted,
  },
  userText: {
    ...typography.bodySmall,
    color: '#FFF',
    lineHeight: 18,
  },
  aiText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    lineHeight: 18,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  loadingText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    ...typography.bodySmall,
    color: colors.text.primary,
    marginRight: spacing.xs,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  sendIcon: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
