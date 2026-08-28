import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';

interface OnboardingScreenProps {
  onFinish: () => void;
}

const slides = [
  {
    icon: 'report',
    title: 'Report Accidents & Hazards',
    description: 'Capture exact GPS location coordinates and snap photographic evidence of road hazards or collisions directly to Ghana MTTD.',
  },
  {
    icon: 'emergency',
    title: 'Instant Emergency Assistance',
    description: 'Directly dial Ambulance (193), Police (18555), Fire Service (192), and discover nearby hospitals in Accra, Kumasi, and across Ghana.',
  },
  {
    icon: 'tips',
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

  const illustration = currentSlide.icon === 'report'
    ? require('../../assets/onboarding/undraw_motion-alert_pr1a.svg')
    : currentSlide.icon === 'emergency'
      ? require('../../assets/onboarding/undraw_phone-call_ov3z.svg')
      : require('../../assets/onboarding/undraw_smartwatch-map_3u18.svg');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.content}>
        <TouchableOpacity style={styles.skipBtn} onPress={onFinish}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.slideContainer}>
          <View style={styles.iconCircle}>
            <Image source={illustration} style={styles.illustration} resizeMode="contain" />
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
    backgroundColor: '#ffffff',
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
    color: '#667085',
    fontWeight: '700',
    fontSize: 14,
  },
  slideContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  illustration: {
    width: 160,
    height: 130,
  },
  iconText: {
    fontSize: 52,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#172b4d',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#667085',
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
    backgroundColor: '#d0d5dd',
  },
  activeIndicator: {
    width: 24,
    backgroundColor: '#0f6cbd',
  },
  nextBtn: {
    backgroundColor: '#0f6cbd',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  nextBtnText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
  },
});
