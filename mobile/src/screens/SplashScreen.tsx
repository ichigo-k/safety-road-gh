import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from '../components/Icon';
import { colors, typography, spacing, radius } from '../theme';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    // Text fade in
    setTimeout(() => {
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, 300);

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    const timer = setTimeout(onFinish, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      <View style={styles.content}>
        {/* Brand Shield Mark */}
        <Animated.View
          style={[
            styles.logoWrap,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.25],
                  outputRange: [0.35, 0],
                }),
              },
            ]}
          />
          <View style={styles.shield}>
            <Icon name="shield-filled" size={40} color={colors.primaryDark} />
          </View>
        </Animated.View>

        {/* Brand Typography */}
        <Animated.View style={[styles.textBlock, { opacity: textOpacity }]}>
          <Text style={styles.appName}>Safety Road</Text>
          <Text style={styles.country}>GHANA</Text>
          <Text style={styles.subtext}>Citizen Road Radar & Emergency Network</Text>
        </Animated.View>
      </View>

      {/* Footer Tagline */}
      <Animated.View style={[styles.footer, { opacity: textOpacity }]}>
        <Text style={styles.footerText}>Ghana MTTD & Citizen Safety Collaboration</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  pulseRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    // White at low alpha: a solid ring would read as a hard disc on green.
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  shield: {
    width: 72,
    height: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    alignItems: 'center',
  },
  appName: {
    ...typography.display,
    fontSize: 28,
    color: '#FFFFFF',
  },
  country: {
    ...typography.label,
    fontSize: 12,
    color: 'rgba(255,255,255,0.72)',
    letterSpacing: 3,
    marginTop: 4,
  },
  subtext: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.78)',
    marginTop: spacing.sm,
  },
  footer: {
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
  },
});
