import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Image, Animated, ActivityIndicator } from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const scale = useRef(new Animated.Value(0.86)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 7, tension: 55, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.content}>
        <Animated.View style={{ opacity, transform: [{ scale }] }}>
          <Image source={require('../../assets/brand/safety-road-logo.png')} style={styles.logo} resizeMode="contain" />
        </Animated.View>
        <View style={styles.loader}><ActivityIndicator size="small" color="#0f6cbd" /></View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    width: 190,
    height: 190,
    // The supplied reference image has a large transparent/white canvas on its right.
    marginLeft: -42,
  },
  loader: {
    marginTop: 22,
    alignItems: 'center',
  },
});
