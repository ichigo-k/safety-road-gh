import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Button, Screen } from '../components/ui';
import { colors, motion, spacing, typography } from '../theme';

import MotionAlert from '../../assets/onboarding/undraw_motion-alert_pr1a.svg';
import PhoneCall from '../../assets/onboarding/undraw_phone-call_ov3z.svg';
import SmartwatchMap from '../../assets/onboarding/undraw_smartwatch-map_3u18.svg';

interface OnboardingScreenProps {
  onFinish: () => void;
}

const slides = [
  {
    key: 'report',
    Art: MotionAlert,
    title: 'Report what you see on the road',
    description:
      'Pin the exact spot, add a photo, and send it straight to the Ghana Police MTTD. Collisions, potholes, flooding — anything that puts drivers at risk.',
  },
  {
    key: 'emergency',
    Art: PhoneCall,
    title: 'Reach help in one tap',
    description:
      'Ambulance on 193, Police MTTD on 18555, Fire Service on 192. All toll free, all reachable without leaving the app.',
  },
  {
    key: 'map',
    Art: SmartwatchMap,
    title: 'Know the road before you drive it',
    description:
      'Live hazard hotspots, closures and advisories verified by road safety authorities, mapped across every region.',
  },
];

export default function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const [index, setIndex] = useState(0);
  const { width } = useWindowDimensions();

  // Onboarding is seen once, so it sits in the tier where a transition earns
  // its place: it stops the illustration and copy swapping abruptly. Transform
  // and opacity only, ~220ms, and it never blocks the Next button.
  const enter = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    enter.setValue(0);
    Animated.timing(enter, {
      toValue: 1,
      duration: 220,
      easing: Easing.bezier(...motion.easeOut),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [index, enter]);

  const slide = slides[index];
  const isLast = index === slides.length - 1;

  const artWidth = Math.min(width - spacing.xl * 2, 340);
  const artHeight = Math.min(artWidth * 0.82, 280);

  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  return (
    <Screen>
      <View style={s.root}>
        {/* ── Skip ────────────────────────────────────────────────────────── */}
        <View style={s.topRow}>
          <Pressable
            onPress={onFinish}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
          >
            <Text style={s.skip}>Skip</Text>
          </Pressable>
        </View>

        {/* ── Slide ───────────────────────────────────────────────────────── */}
        <Animated.View style={[s.slide, { opacity: enter, transform: [{ translateY }] }]}>
          <View style={[s.art, { width: artWidth, height: artHeight }]}>
            {/* preserveAspectRatio does the fitting, so illustrations with
                very different aspect ratios still sit in an identical box. */}
            <slide.Art width={artWidth} height={artHeight} />
          </View>

          <Text style={s.title}>{slide.title}</Text>
          <Text style={s.description}>{slide.description}</Text>
        </Animated.View>

        {/* ── Controls ────────────────────────────────────────────────────── */}
        <View style={s.bottom}>
          <View style={s.dots} accessibilityRole="tablist">
            {slides.map((item, i) => (
              <Pressable
                key={item.key}
                onPress={() => setIndex(i)}
                hitSlop={10}
                accessibilityRole="tab"
                accessibilityLabel={`Step ${i + 1} of ${slides.length}`}
                accessibilityState={{ selected: i === index }}
              >
                <View style={[s.dot, i === index && s.dotActive]} />
              </Pressable>
            ))}
          </View>

          <Button
            label={isLast ? 'Get started' : 'Next'}
            size="lg"
            full
            onPress={() => (isLast ? onFinish() : setIndex(index + 1))}
          />
        </View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    justifyContent: 'space-between',
  },

  topRow: { flexDirection: 'row', justifyContent: 'flex-end', minHeight: 32 },
  skip: { fontSize: 15, fontWeight: '500', color: colors.textSubtle },

  slide: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  art: { alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xxl },

  title: {
    ...typography.display,
    fontSize: 27,
    lineHeight: 33,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSubtle,
    textAlign: 'center',
    marginTop: spacing.md,
    maxWidth: 330,
  },

  bottom: { gap: spacing.xl },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.borderStrong,
  },
  dotActive: { width: 22, backgroundColor: colors.primary },
});
