import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar } from 'react-native';

export default function NotificationsScreen() {
  const notifications = [
    {
      id: '1',
      title: 'Report Status Update',
      message: 'Your report SR-GH-2026-9482 has been verified by MTTD Command.',
      time: '10 mins ago',
      type: 'STATUS',
    },
    {
      id: '2',
      title: 'Emergency Alert Broadcast',
      message: 'Traffic alert: Heavy congestion on Accra-Tema Motorway near Ashaiman.',
      time: '1 hour ago',
      type: 'ALERT',
    },
    {
      id: '3',
      title: 'Safety Tip Published',
      message: 'New driver guidance published for rainy season hydroplaning safety.',
      time: '1 day ago',
      type: 'INFO',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Notifications Feed</Text>
        <Text style={styles.headerSubtitle}>Status updates on reported incidents & road emergency broadcasts</Text>

        {notifications.map((n) => (
          <View key={n.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.typeBadge}>[{n.type}]</Text>
              <Text style={styles.time}>{n.time}</Text>
            </View>
            <Text style={styles.title}>{n.title}</Text>
            <Text style={styles.message}>{n.message}</Text>
          </View>
        ))}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  typeBadge: {
    color: '#f59e0b',
    fontSize: 10,
    fontWeight: '900',
  },
  time: {
    color: '#64748b',
    fontSize: 11,
  },
  title: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 4,
  },
  message: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
});
