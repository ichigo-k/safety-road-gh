import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';

interface EmailVerificationScreenProps {
  email: string;
  onVerified: () => void;
}

export default function EmailVerificationScreen({ email, onVerified }: EmailVerificationScreenProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    if (!code) {
      Alert.alert('Required', 'Please enter the 6-digit verification code sent to your email.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Verified!', 'Your email address has been verified successfully.');
      onVerified();
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>✉️</Text>
        </View>

        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>We sent a 6-digit verification code to <Text style={{ color: '#f59e0b', fontWeight: 'bold' }}>{email || 'your email address'}</Text>. Enter it below to activate your citizen account.</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>6-Digit Verification Code</Text>
          <TextInput
            style={styles.input}
            placeholder="123456"
            placeholderTextColor="#64748b"
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={setCode}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify Email & Continue'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendBtn} onPress={() => Alert.alert('Sent', 'A new verification code has been resent to your email.')}>
          <Text style={styles.resendText}>Didn't receive code? Resend Code</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 2,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#cbd5e1',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 4,
  },
  button: {
    backgroundColor: '#f59e0b',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0f172a',
    fontWeight: '900',
    fontSize: 15,
  },
  resendBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
});
