import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';

interface OnboardingScreenProps {
  onFinish: () => void;
}

const slides = [
  {
    icon: '🚨',
    title: 'Report Accidents & Hazards',
    description: 'Capture exact GPS location coordinates and snap photographic evidence of road hazards or collisions directly to Ghana MTTD.',
  },
  {
    icon: '🚑',
    title: 'Instant Emergency Assistance',
    description: 'Directly dial Ambulance (193), Police (18555), Fire Service (192), and discover nearby hospitals in Accra, Kumasi, and across Ghana.',
  },
  {
    icon: '💡',
    title: 'Live Road Alerts & Safety Tips',
    description: 'Receive real-time traffic broadcast alerts from road authorities and access safety guidelines tailored for drivers, riders, and pedestrians.',
  },
];

export default function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish();
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={styles.content}>
        <TouchableOpacity style={styles.skipBtn} onPress={onFinish}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.slideContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>{currentSlide.icon}</Text>
          </View>

          <Text style={styles.title}>{currentSlide.title}</Text>
          <Text style={styles.description}>{currentSlide.description}</Text>
        </View>

        {/* Indicators */}
        <View style={styles.indicatorContainer}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.indicator, i === currentIndex && styles.activeIndicator]}
            />
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
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
    justifyContent: 'space-between',
  },
  skipBtn: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  skipText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 14,
  },
  slideContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  iconText: {
    fontSize: 52,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 22,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  activeIndicator: {
    width: 24,
    backgroundColor: '#f59e0b',
  },
  nextBtn: {
    backgroundColor: '#f59e0b',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  nextBtnText: {
    color: '#0f172a',
    fontWeight: '900',
    fontSize: 16,
  },
});
