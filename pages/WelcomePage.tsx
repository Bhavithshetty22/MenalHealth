import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  StatusBar,
  Easing,
  ScrollView,
  PanResponder,
  ImageBackground,
} from 'react-native';
import { useFonts } from 'expo-font';

const { width, height } = Dimensions.get('window');

const WelcomePage = ({ onGetStarted, onLogin }) => {
  // Expanded mood options - moved to useMemo to ensure stability
  const moodOptions = useMemo(() => [
    { id: 0, label: 'Excited', color: '#FF6B6B' },
    { id: 1, label: 'Joyful', color: '#4ECDC4' },
    { id: 2, label: 'Cheerful', color: '#FFD93D' },
    { id: 3, label: 'Calm', color: '#45B7D1' },
    { id: 4, label: 'Peaceful', color: '#96CEB4' },
    { id: 5, label: 'Relaxed', color: '#FFEAA7' },
    { id: 6, label: 'Content', color: '#DDA0DD' },
    { id: 7, label: 'Grateful', color: '#98D8C8' },
    { id: 8, label: 'Hopeful', color: '#A8E6CF' },
  ], []);

  // State for selected mood
  const [fontsLoaded] = useFonts({
    Wisteriano: require("../assets/fonts/WisterianoRegular-BL9Zn.ttf"),
  });
  
  const [selectedMood, setSelectedMood] = useState(null);
  
  // State for card position
  const [cardPosition, setCardPosition] = useState('middle'); // 'up', 'middle', 'down'

  // Animated values for smooth entrance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const blobScale = useRef(new Animated.Value(0.8)).current;
  const mainButtonScale = useRef(new Animated.Value(0)).current;
  const sliderOpacity = useRef(new Animated.Value(0)).current;
  
  // Card swipe animation
  const cardTranslateY = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;

  // Create animated values for each mood button - FIXED: Initialize properly
  const buttonScales = useRef(
    moodOptions.map(() => new Animated.Value(1))
  ).current;

  // Define card positions
  const cardPositions = useMemo(() => ({
    up: -height * 0.3, // Move card up significantly
    middle: 0, // Default position
    down: height * 0.15, // Move card down partially
  }), []);

  // Handle pan gesture for card swiping using PanResponder - memoized to prevent recreation
  const panResponder = useMemo(
    () => PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to vertical gestures
        return Math.abs(gestureState.dy) > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        // Set offset to current value when gesture starts
        cardTranslateY.setOffset(cardTranslateY._value);
        cardTranslateY.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Update the animated value during the gesture
        cardTranslateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Flatten the offset
        cardTranslateY.flattenOffset();
        
        const { dy, vy } = gestureState;
        
        let newPosition = cardPosition;
        let targetY = cardPositions[cardPosition];

        // Determine new position based on gesture
        if (dy < -100 || vy < -0.5) {
          // Swipe up - only from down to middle
          if (cardPosition === 'down') {
            newPosition = 'middle';
            targetY = cardPositions.middle;
          }
        } else if (dy > 100 || vy > 0.5) {
          // Swipe down - only from middle to down
          if (cardPosition === 'middle') {
            newPosition = 'down';
            targetY = cardPositions.down;
          }
        }

        // Animate to new position
        setCardPosition(newPosition);
        
        Animated.parallel([
          Animated.spring(cardTranslateY, {
            toValue: targetY,
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(cardOpacity, {
            toValue: 1, // Always keep full opacity
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      },
    }),
    [cardPosition, cardPositions, cardTranslateY, cardOpacity]
  );

  useEffect(() => {
    // Only start animation after fonts are loaded
    if (fontsLoaded) {
      startWelcomeAnimation();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#ffffff' }}>Loading...</Text>
      </View>
    );
  }

  const startWelcomeAnimation = () => {
    // Staggered entrance animations
    Animated.parallel([
      // Fade in everything
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Slide up content
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
        delay: 200,
      }),
      // Scale in blob
      Animated.spring(blobScale, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
        delay: 400,
      }),
      // Fade in slider
      Animated.timing(sliderOpacity, {
        toValue: 1,
        duration: 600,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Main button last
    Animated.spring(mainButtonScale, {
      toValue: 1,
      tension: 100,
      friction: 8,
      delay: 1000,
      useNativeDriver: true,
    }).start();
  };

  const handleGetStarted = () => {
    // Add a nice button press animation
    Animated.sequence([
      Animated.spring(mainButtonScale, {
        toValue: 0.95,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(mainButtonScale, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onGetStarted?.();
    });
  };

  // New function to handle login navigation
  const handleLoginPress = () => {
    // Call the onLogin callback if provided, otherwise call onGetStarted for compatibility
    if (onLogin) {
      onLogin();
    } else {
      onGetStarted?.();
    }
  };

  const handleMoodPress = (index) => {
    // First reset all buttons to normal scale
    buttonScales.forEach((scale, i) => {
      if (i !== index) {
        Animated.spring(scale, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }).start();
      }
    });

    // Set selected mood
    setSelectedMood(index);

    // Animate the pressed button
    Animated.sequence([
      Animated.spring(buttonScales[index], {
        toValue: 0.9,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScales[index], {
        toValue: 1.15, // Scale up the selected button
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderMoodButton = (mood, index) => {
    const isSelected = selectedMood === index;
    
    return (
      <Animated.View
        key={mood.id}
        style={[
          styles.moodButtonWrapper,
          {
            transform: [{ scale: buttonScales[index] }],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.moodButton,
            {
              backgroundColor: isSelected ? mood.color : '#4A4A4A',
              borderWidth: isSelected ? 2 : 0,
              borderColor: isSelected ? '#ffffff' : 'transparent',
            }
          ]}
          onPress={() => handleMoodPress(index)}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.moodButtonText,
            {
              color: isSelected ? '#2A2A2A' : '#ffffff',
              fontWeight: isSelected ? '700' : '600',
              // Apply Wisteriano font if loaded
              fontFamily: 'System',
            }
          ]}>
            {mood.label}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2A2A2A" barStyle="light-content" />
      
      {/* Top Section */}
      <Animated.View
        style={[
          styles.topSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Main Question */}
        <Text style={[
          styles.mainQuestion,
          // Apply Wisteriano font to main question
          { fontFamily: fontsLoaded ? 'Wisteriano' : 'System' }
        ]}>
          How are you{'\n'}feeling today?
        </Text>
        
        {/* Mood Selection Slider */}
        <Animated.View
          style={[
            styles.moodSliderContainer,
            {
              opacity: sliderOpacity,
            },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moodScrollContent}
            decelerationRate="fast"
            snapToInterval={120} // Approximate button width + margin
            snapToAlignment="center"
            style={styles.moodScrollView}
          >
            {moodOptions.map((mood, index) => renderMoodButton(mood, index))}
          </ScrollView>
        </Animated.View>
      </Animated.View>

      {/* Swipeable Bottom Section with Blob Character */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.bottomSection,
          {
            opacity: Animated.multiply(fadeAnim, cardOpacity),
            transform: [
              { scale: blobScale },
              { translateY: cardTranslateY }
            ],
          },
        ]}
      >
        {/* Large Yellow Blob Container with Background Image */}
        <ImageBackground
          source={require('../assets/welcome.png')}
          style={styles.blobContainer}
          resizeMode="cover"
          imageStyle={styles.backgroundImage}
        >
          

            {/* Get Started Button */}
            <Animated.View
              style={[
                styles.getStartedButtonContainer,
                {
                  transform: [{ scale: mainButtonScale }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.getStartedButton}
                onPress={handleGetStarted}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.getStartedButtonText,
                  { fontFamily: 'System' }
                ]}>
                  Get Started
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Bottom Text with Login Link */}
            <Text style={[
              styles.bottomText,
              { fontFamily: 'System' }
            ]}>
              Already have an account?{' '}
              <TouchableOpacity onPress={handleLoginPress} style={styles.loginTouchable}>
                <Text style={styles.loginText}>Log In</Text>
              </TouchableOpacity>
            </Text>
          
        </ImageBackground>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2A2A2A',
  },
  topSection: {
    flex: 0.6,
    paddingHorizontal: 32,
    paddingTop: 80,
    justifyContent: 'flex-start',
  },
  mainQuestion: {
    fontSize: 45,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 40,
    paddingVertical: 17,
    marginBottom: 5,
    marginTop: 5,
    fontFamily: 'Wisteriano',
    letterSpacing: -1
  },
  moodSliderContainer: {
    marginBottom: 30,
    height: 90, // Increased height to accommodate scaling
    overflow: 'visible', // Allow scaled buttons to be visible
  },
  moodScrollView: {
    flexGrow: 0,
    overflow: 'visible', // Allow overflow for scaling
  },
  moodScrollContent: {
    paddingHorizontal: (width - 100) / 2, // Perfect centering calculation
    alignItems: 'center',
    paddingVertical: 10, // Extra padding for scaled buttons
  },
  moodButtonWrapper: {
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100, // Fixed width for consistent spacing
  },
  moodButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100, // Fixed width
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  moodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  skipText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
  bottomSection: {
    flex: 0.4,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  blobContainer: {
    alignItems: 'center',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 380,
    paddingBottom: 130,
    paddingHorizontal: 32,
    position: 'relative',
    overflow: 'hidden', // Changed to hidden to contain background image
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  backgroundImage: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },

  
  getStartedButtonContainer: {
    width: '100%',
    marginBottom: 40,
  },
  getStartedButton: {
  backgroundColor: '#2A2A2A',
  paddingVertical: 20,
  paddingHorizontal:110,
  borderRadius: 30,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
  position:'absolute',
  zIndex: 100, // Add this
},
getStartedButtonText: {
  fontSize: 18,
  fontWeight: '500',
  color: 'white',
  // Remove zIndex from here
},
  bottomText: {
    fontSize: 14,
    color: '#2A2A2A',
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop:30,
    marginBottom:-40
  },
  loginTouchable: {
    // Remove any padding/margin that might interfere with touch
  },
  loginText: {
    fontWeight: '600',
    textDecorationLine: 'underline',
    color: '#2A2A2A',
  },
});

export default WelcomePage;