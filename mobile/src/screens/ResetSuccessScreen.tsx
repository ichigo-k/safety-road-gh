import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';

interface ResetSuccessScreenProps {
  onBackToLogin: () => void;
}

export default function ResetSuccessScreen({ onBackToLogin }: ResetSuccessScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>✅</Text>
        </View>

        <Text style={styles.title}>Password Reset Successful!</Text>
        <Text style={styles.subtitle}>Your Safety Road GH account password has been updated securely. You can now sign in with your new password.</Text>

        <TouchableOpacity style={styles.button} onPress={onBackToLogin}>
          <Text style={styles.buttonText}>Sign In Now</Text>
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
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 2,
    borderColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    maxWidth: 300,
  },
  button: {
    backgroundColor: '#f59e0b',
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#0f172a',
    fontWeight: '900',
    fontSize: 15,
  },
});
