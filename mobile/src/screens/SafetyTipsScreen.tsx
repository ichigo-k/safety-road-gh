import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { apiFetch } from '../services/api';
import Icon from '../components/Icon';

export default function SafetyTipsScreen() {
  const [tips, setTips] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('DRIVER');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      const res = await apiFetch('/safety-tips');
      if (res.tips) setTips(res.tips);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredTips = tips.filter((t) => t.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Road Safety Guide</Text>
        <Text style={styles.headerSubtitle}>Ghana Highway Authority & MTTD Educational Safety Rules</Text>

        {/* Category Tabs */}
        <View style={styles.tabGrid}>
          {[
            { id: 'DRIVER', label: 'Drivers', icon: 'car' },
            { id: 'MOTORCYCLIST', label: 'Riders', icon: 'motorcycle' },
            { id: 'PEDESTRIAN', label: 'Pedestrians', icon: 'walk' },
            { id: 'PASSENGER', label: 'Passengers', icon: 'bus' },
          ].map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.tab, selectedCategory === cat.id && styles.activeTab]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <View style={styles.tabRow}>
                <Icon name={cat.icon} size={16} color={selectedCategory === cat.id ? '#0f172a' : '#cbd5e1'} />
                <Text style={[styles.tabText, selectedCategory === cat.id && styles.activeTabText]}>
                  {cat.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips List */}
        {loading ? (
          <Text style={styles.loadingText}>Loading safety articles...</Text>
        ) : filteredTips.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No guides available for this category.</Text>
          </View>
        ) : (
          filteredTips.map((tip) => (
            <View key={tip.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.categoryBadge}>{tip.category}</Text>
              </View>
              <Text style={styles.title}>{tip.title}</Text>
              <Text style={styles.content}>{tip.content}</Text>
            </View>
          ))
        )}
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
  tabGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#60a5fa',
    borderColor: '#60a5fa',
  },
  tabText: {
    color: '#cbd5e1',
    fontWeight: '800',
    fontSize: 13,
  },
  activeTabText: {
    color: '#0f172a',
  },
  loadingText: {
    color: '#64748b',
    textAlign: 'center',
    padding: 20,
  },
  emptyBox: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    marginBottom: 6,
  },
  categoryBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#60a5fa',
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  title: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 6,
  },
  content: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
  },
});
