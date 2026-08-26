import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, Linking } from 'react-native';

interface HelpSupportScreenProps {
  onBack: () => void;
}

export default function HelpSupportScreen({ onBack }: HelpSupportScreenProps) {
  const faqs = [
    {
      q: 'How do I submit an accident or hazard report?',
      a: 'Tap the "Report" tab at the bottom, select either Accident or Hazard, enter details, verify your GPS location, attach a photo, and tap Submit.',
    },
    {
      q: 'Who reviews submitted road reports?',
      a: 'All submitted reports are sent directly to Ghana MTTD Command Officers and verified before dispatching emergency teams or updating road alert feeds.',
    },
    {
      q: 'What should I do in a severe life-threatening emergency?',
      a: 'Tap the red SOS button or use the Emergency Help directory to immediately call Ghana National Ambulance Service (193), Police (18555 / 112), or Fire (192).',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Back to Profile</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Help & Support Center</Text>
        <Text style={styles.subtitle}>Frequently asked questions and official support contacts</Text>

        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
        </View>

        {faqs.map((faq, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.question}>Q: {faq.q}</Text>
            <Text style={styles.answer}>{faq.a}</Text>
          </View>
        ))}

        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>Need Additional Assistance?</Text>
          <Text style={styles.supportDesc}>Contact the Safety Road GH support desk or National Road Safety Authority (NRSA).</Text>
          <TouchableOpacity style={styles.supportBtn} onPress={() => Linking.openURL('mailto:support@safetyroad.gov.gh')}>
            <Text style={styles.supportBtnText}>✉️ Email Support Desk</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 20,
  },
  backBtn: {
    marginBottom: 16,
  },
  backText: {
    color: '#f59e0b',
    fontWeight: '700',
    fontSize: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 20,
  },
  sectionTitleRow: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#f59e0b',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  question: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 6,
  },
  answer: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
  supportCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 16,
    padding: 18,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  supportTitle: {
    color: '#f59e0b',
    fontWeight: '900',
    fontSize: 15,
    marginBottom: 4,
  },
  supportDesc: {
    color: '#cbd5e1',
    fontSize: 12,
    marginBottom: 14,
  },
  supportBtn: {
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  supportBtnText: {
    color: '#0f172a',
    fontWeight: '900',
    fontSize: 14,
  },
});
