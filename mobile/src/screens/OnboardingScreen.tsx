import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import Icon from '../components/Icon';
import { colors, typography, spacing, radius, shadows } from '../theme';

interface OnboardingScreenProps {
  onFinish: () => void;
}

const slides = [
  {
    number: '01',
    icon: 'accident',
    iconColor: colors.googleRed,
    iconBg: colors.googleRedLight,
    title: 'Report Incidents & Hazards',
    description:
      'Capture exact GPS coordinates and snap live evidence of collisions, potholes, and road dangers directly to Ghana Police MTTD.',
  },
  {
    number: '02',
    icon: 'ambulance',
    iconColor: colors.googleBlue,
    iconBg: colors.googleBlueLight,
    title: 'Instant Emergency Response',
    description:
      'Direct 1-tap toll-free calling to Ambulance (193), Police (18555 / 112), and Fire Service (192) across all Ghana regions.',
  },
  {
    number: '03',
    icon: 'map',
    iconColor: colors.primary,
    iconBg: colors.primaryLight,
    title: 'Live Highway Radar & Alerts',
    description:
      'Explore active road warnings, hazard hotspots, traffic updates, and safety manuals verified by road safety authorities.',
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
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.content}>
        {/* Top bar with Skip button */}
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.skipBtn} onPress={onFinish} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Slide Body */}
        <View style={styles.slideArea}>
          <View style={[styles.iconContainer, { backgroundColor: currentSlide.iconBg }]}>
            <Icon name={currentSlide.icon} size={36} color={currentSlide.iconColor} />
          </View>
          <Text style={styles.slideStep}>FEATURE {currentSlide.number}</Text>
          <Text style={styles.slideTitle}>{currentSlide.title}</Text>
          <Text style={styles.slideDesc}>{currentSlide.description}</Text>
        </View>

        {/* Bottom Navigation Area */}
        <View style={styles.bottomArea}>
          <View style={styles.dotsRow}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === currentIndex && [styles.dotActive, { backgroundColor: colors.primary }],
                ]}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.nextBtnText}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Next Step'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  skipBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  skipText: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  slideArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  slideStep: {
    ...typography.label,
    color: colors.primaryDark,
    marginBottom: 6,
  },
  slideTitle: {
    ...typography.headline,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  slideDesc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  bottomArea: {
    gap: spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  nextBtn: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  nextBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
