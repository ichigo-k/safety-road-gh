import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Linking,
} from 'react-native';
import { apiFetch } from '../services/api';
import Icon from '../components/Icon';

export default function EmergencyScreen() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    fetchEmergencyServices();
  }, []);

  const fetchEmergencyServices = async () => {
    try {
      const res = await apiFetch('/emergency-services');
      if (res.services) setServices(res.services);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const makeCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const filteredServices = services.filter(
    (s) => selectedCategory === 'ALL' || s.category === selectedCategory
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Emergency Services (Ghana)</Text>
        <Text style={styles.headerSubtitle}>Instant direct dial for Police, Fire, Ambulance & Hospitals</Text>

        {/* Toll-Free National Hotlines Banner */}
        <View style={styles.nationalHotlineCard}>
          <Text style={styles.hotlineHeader}>NATIONAL EMERGENCY TOLL-FREE NUMBERS</Text>
          <View style={styles.hotlineGrid}>
            <TouchableOpacity style={styles.hotlineChip} onPress={() => makeCall('193')}>
              <Icon name="ambulance" size={20} color="#ef4444" />
              <Text style={styles.hotlineTitle}>Ambulance</Text>
              <Text style={styles.hotlineNum}>193 / 112</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.hotlineChip} onPress={() => makeCall('18555')}>
              <Icon name="police" size={20} color="#3b82f6" />
              <Text style={styles.hotlineTitle}>Police MTTD</Text>
              <Text style={styles.hotlineNum}>18555 / 191</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.hotlineChip} onPress={() => makeCall('192')}>
              <Icon name="fire" size={20} color="#f97316" />
              <Text style={styles.hotlineTitle}>Fire Service</Text>
              <Text style={styles.hotlineNum}>192 / 112</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Categories */}
        <View style={styles.filterRow}>
          {['ALL', 'HOSPITAL', 'POLICE', 'FIRE_AMBULANCE'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterBtn, selectedCategory === cat && styles.filterBtnActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.filterText, selectedCategory === cat && styles.filterTextActive]}>
                {cat.replace('_', ' & ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Directory List */}
        {loading ? (
          <Text style={styles.loadingText}>Loading directory...</Text>
        ) : (
          filteredServices.map((service) => (
            <View key={service.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.categoryBadge}>{service.category}</Text>
                <Text style={styles.regionText}>{service.region}</Text>
              </View>

              <Text style={styles.serviceName}>{service.name}</Text>
              <View style={styles.addressRow}>
                <Icon name="location" size={12} color="#94a3b8" />
                <Text style={styles.address}>{service.address}</Text>
              </View>

              <View style={styles.callRow}>
                <TouchableOpacity style={styles.callButton} onPress={() => makeCall(service.phone)}>
                  <Icon name="phone" size={14} color="#0f172a" />
                  <Text style={styles.callButtonText}>Call {service.phone}</Text>
                </TouchableOpacity>

                {service.altPhone && (
                  <TouchableOpacity style={styles.altCallButton} onPress={() => makeCall(service.altPhone)}>
                    <Text style={styles.altCallButtonText}>Alt: {service.altPhone}</Text>
                  </TouchableOpacity>
                )}
              </View>
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
    marginBottom: 16,
  },
  nationalHotlineCard: {
    backgroundColor: '#7f1d1d',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#b91c1c',
    marginBottom: 20,
  },
  hotlineHeader: {
    color: '#fef08a',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 12,
  },
  hotlineGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  hotlineChip: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  hotlineTitle: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
  },
  hotlineNum: {
    color: '#fef08a',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  filterBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterBtnActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  filterText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
  },
  filterTextActive: {
    color: '#0f172a',
  },
  loadingText: {
    color: '#64748b',
    textAlign: 'center',
    padding: 20,
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
  categoryBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  regionText: {
    color: '#94a3b8',
    fontSize: 11,
  },
  serviceName: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  address: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  callRow: {
    flexDirection: 'row',
    gap: 8,
  },
  callButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  callButtonText: {
    color: '#0f172a',
    fontWeight: '900',
    fontSize: 13,
  },
  altCallButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  altCallButtonText: {
    color: '#cbd5e1',
    fontWeight: '700',
    fontSize: 11,
  },
});
