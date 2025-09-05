import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  Dimensions,
  StyleSheet,
  StatusBar,
  Easing,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const IntroAnimation = ({ onAnimationComplete }) => {
  // Single animated values for better performance
  const animatedValue = useRef(new Animated.Value(0)).current;
  const blobScale = useRef(new Animated.Value(0)).current;
  const colorPhase = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const bounceValue = useRef(new Animated.Value(0)).current;
  const finalTransition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startSmoothAnimation();
  }, []);

  const startSmoothAnimation = () => {
    // Master timeline animation
    const masterAnimation = Animated.timing(animatedValue, {
      toValue: 5,
      duration: 5000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });

    // Blob entrance with smooth spring
    const blobEntrance = Animated.spring(blobScale, {
      toValue: 1,
      tension: 40,
      friction: 6,
      useNativeDriver: true,
      delay: 800,
    });

    // Color morphing animation
    const colorAnimation = Animated.sequence([
      Animated.delay(1000),
      Animated.timing(colorPhase, {
        toValue: 1,
        duration: 600,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: false,
      }),
      Animated.timing(colorPhase, {
        toValue: 2,
        duration: 600,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: false,
      }),
      Animated.timing(colorPhase, {
        toValue: 0,
        duration: 600,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: false,
      }),
    ]);

    // Logo fade in
    const logoAnimation = Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
      delay: 2000,
    });

    // Bounce gesture
    const bounceAnimation = Animated.sequence([
      Animated.delay(3000),
      Animated.spring(bounceValue, {
        toValue: 1,
        tension: 200,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.spring(bounceValue, {
        toValue: 0,
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }),
    ]);

    // Final transition
    const exitAnimation = Animated.timing(finalTransition, {
      toValue: 1,
      duration: 800,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
      delay: 4000,
    });

    // Start all animations
    Animated.parallel([
      masterAnimation,
      blobEntrance,
      colorAnimation,
      logoAnimation,
      bounceAnimation,
      exitAnimation,
    ]).start(() => {
      onAnimationComplete?.();
    });
  };

  // Smooth interpolations
  const backgroundOpacity = animatedValue.interpolate({
    inputRange: [0, 1, 5],
    outputRange: [0, 1, 1],
    extrapolate: 'clamp',
  });

  const blobTranslateY = animatedValue.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [100, 0, 0],
    extrapolate: 'clamp',
  });

  const logoTranslateY = animatedValue.interpolate({
    inputRange: [0, 2, 3],
    outputRange: [50, 50, 0],
    extrapolate: 'clamp',
  });

  const glowOpacity = animatedValue.interpolate({
    inputRange: [0, 3, 4, 5],
    outputRange: [0, 0, 0.4, 0.2],
    extrapolate: 'clamp',
  });

  const finalScale = finalTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const finalOpacity = finalTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const finalY = finalTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -80],
    extrapolate: 'clamp',
  });

  // Color interpolation for smooth morphing
  const getBlobColor = () => {
    return colorPhase.interpolate({
      inputRange: [0, 1, 2],
      outputRange: ['rgb(255, 217, 61)', 'rgb(78, 205, 196)', 'rgb(255, 107, 157)'],
      extrapolate: 'clamp',
    });
  };

  const getBounceScale = () => {
    return bounceValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.15],
      extrapolate: 'clamp',
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Background with smooth gradient */}
      <Animated.View
        style={[
          styles.background,
          {
            opacity: backgroundOpacity,
          },
        ]}
      />

      {/* Main content */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: finalOpacity,
            transform: [
              { scale: finalScale },
              { translateY: finalY },
            ],
          },
        ]}
      >
        {/* Smooth glow effect */}
        <Animated.View
          style={[
            styles.glowContainer,
            {
              opacity: glowOpacity,
              transform: [{ scale: getBounceScale() }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.glow,
              {
                backgroundColor: getBlobColor(),
              },
            ]}
          />
        </Animated.View>

        {/* Blob character */}
        <Animated.View
          style={[
            styles.blobContainer,
            {
              transform: [
                { scale: Animated.multiply(blobScale, getBounceScale()) },
                { translateY: blobTranslateY },
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.blob,
              {
                backgroundColor: getBlobColor(),
              },
            ]}
          >
            {/* Animated eyes */}
            <View style={styles.eyes}>
              <Animated.View
                style={[
                  styles.eye,
                  {
                    transform: [
                      {
                        scaleY: bounceValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 0.3],
                          extrapolate: 'clamp',
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.eye,
                  {
                    transform: [
                      {
                        scaleY: bounceValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 0.3],
                          extrapolate: 'clamp',
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>
            
            {/* Animated mouth */}
            <Animated.View
              style={[
                styles.mouth,
                {
                  transform: [
                    {
                      scaleX: bounceValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.3],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
            />
          </Animated.View>
        </Animated.View>

        {/* Logo with smooth entrance */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ translateY: logoTranslateY }],
            },
          ]}
        >
          <Text style={styles.logoText}>MoodCompanion</Text>
          <Text style={styles.logoSubtext}>Your emotional wellness partner</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1A1A1A',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  glowContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.3,
  },
  blobContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  blob: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  eyes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 32,
    marginBottom: 12,
  },
  eye: {
    width: 8,
    height: 8,
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    borderRadius: 4,
  },
  mouth: {
    width: 24,
    height: 12,
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    borderRadius: 12,
    marginTop: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    zIndex: 1,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  logoSubtext: {
    fontSize: 16,
    color: '#b8b8c8',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '400',
    opacity: 0.9,
  },
});

export default IntroAnimation;