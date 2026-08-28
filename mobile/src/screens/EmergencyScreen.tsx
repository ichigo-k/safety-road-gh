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
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
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
                  <Icon name="phone" size={14} color="#ffffff" />
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
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#172b4d',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#667085',
    marginBottom: 16,
  },
  nationalHotlineCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 20,
  },
  hotlineHeader: {
    color: '#DC2626',
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  hotlineTitle: {
    color: '#172b4d',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
  },
  hotlineNum: {
    color: '#DC2626',
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
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterBtnActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  filterText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  loadingText: {
    color: '#94A3B8',
    textAlign: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  regionText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  serviceName: {
    color: '#172b4d',
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
    color: '#667085',
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
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 13,
  },
  altCallButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  altCallButtonText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 11,
  },
});
