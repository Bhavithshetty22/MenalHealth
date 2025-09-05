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
} from 'react-native';
import { useFonts } from 'expo-font'; // Add this import

const { width, height } = Dimensions.get('window');

const WelcomePage = ({ onGetStarted }) => {
  // State for selected mood
  const [fontsLoaded] = useFonts({
    Wisteriano: require("../assets/fonts/WisterianoRegular-BL9Zn.ttf"),
  });
  
  const [selectedMood, setSelectedMood] = useState(null);
  
  // State for card position
  const [cardPosition, setCardPosition] = useState('middle'); // 'up', 'middle', 'down'

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

  // Animated values for smooth entrance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const blobScale = useRef(new Animated.Value(0.8)).current;
  const mainButtonScale = useRef(new Animated.Value(0)).current;
  const sliderOpacity = useRef(new Animated.Value(0)).current;
  
  // Card swipe animation
  const cardTranslateY = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;

  // Create animated values for each mood button - fixed to prevent recreation
  const buttonScales = useRef(null);
  if (buttonScales.current === null) {
    buttonScales.current = moodOptions.map(() => new Animated.Value(1));
  }

  // Define card positions
  const cardPositions = useMemo(() => ({
    up: -height * 0.3, // Move card up significantly
    middle: 0, // Default position
    down: height * 0.15, // Move card down partially
  }), []);

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

  const handleMoodPress = (index) => {
    // First reset all buttons to normal scale
    buttonScales.current.forEach((scale, i) => {
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
      Animated.spring(buttonScales.current[index], {
        toValue: 0.9,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScales.current[index], {
        toValue: 1.15, // Scale up the selected button
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle pan gesture for card swiping using PanResponder - memoized to prevent recreation
  const panResponder = useRef(
    PanResponder.create({
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
    })
  ).current;

  const renderMoodButton = (mood, index) => {
    const isSelected = selectedMood === index;
    
    return (
      <Animated.View
        key={mood.id}
        style={[
          styles.moodButtonWrapper,
          {
            transform: [{ scale: buttonScales.current[index] }],
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
        <Text style={styles.mainQuestion} includeFontPadding={false}>
  How are you feeling today?
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
        {/* Drag Handle */}
        <Text style={styles.swipeToKnowMore}>Swipe to know more</Text>
        <View style={styles.dragHandle}>
         <View style={styles.dragHandle1} />
         </View>
        
        {/* Large Yellow Blob Character */}
        <View style={styles.blobContainer}>
          <View style={styles.blob}>
            {/* Happy Eyes */}
            <View style={styles.eyes}>
              <View style={styles.eyeLeft}>
                <View style={styles.eyeClosed} />
              </View>
              <View style={styles.eyeRight}>
                <View style={styles.eyeClosed} />
              </View>
            </View>
            
            {/* Happy Mouth */}
            <View style={styles.happyMouth}>
              <View style={styles.teeth} />
            </View>
          </View>

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

          {/* Bottom Text */}
          <Text style={[
            styles.bottomText,
            { fontFamily: 'System' }
          ]}>
            Already have an account? <Text style={styles.loginText}>Log In</Text>
          </Text>
        </View>
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
    paddingVertical:17,
    marginBottom: 5,
    marginTop: 5,
    fontFamily:'Wisteriano',
    letterSpacing:-1
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
    width: 95, // Fixed width for consistent spacing
  },
  moodButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: 95, // Fixed width
    height: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth:2,
    borderColor:"#4A4A4A"
  },
  moodButtonText: {
    fontSize: 12,
    fontWeight: '400',
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
  swipeToKnowMore:{
    fontSize:14,
    textAlign:'center',
    marginTop:0,
    zIndex:10,
    color:'#a7a7a7ff'
  },
  dragHandle: {
    width: 70,
    height: 50,
    backgroundColor: '#2A2A2A',
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: -20,
    marginTop: -15,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragHandle1: {
    width: 30,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginTop:20,
    zIndex: 2,
  },
  blobContainer: {
    alignItems: 'center',
    backgroundColor: '#FFD93D',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 230,
    paddingBottom: 130,
    paddingHorizontal: 32,
    position: 'relative',
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  blob: {
    width: 120,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  eyes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 50,
    marginBottom: 15,
  },
  eyeLeft: {
    width: 16,
    height: 6,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeRight: {
    width: 16,
    height: 6,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeClosed: {
    width: 12,
    height: 2,
    backgroundColor: '#2A2A2A',
    borderRadius: 1,
  },
  happyMouth: {
    width: 40,
    height: 20,
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  teeth: {
    width: 30,
    height: 8,
    backgroundColor: '#FFD93D',
    borderRadius: 4,
  },
  getStartedButtonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  getStartedButton: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  getStartedButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
  },
  bottomText: {
    fontSize: 14,
    color: '#2A2A2A',
    textAlign: 'center',
  },
  loginText: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default WelcomePage;