import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  StatusBar,
  ScrollView,
  Easing,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const MainApp = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Animated values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const moodScales = useRef(
    Array(5).fill(0).map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    startEntranceAnimation();
  }, []);

  const startEntranceAnimation = () => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered mood button animations
    moodScales.forEach((scale, index) => {
      Animated.spring(scale, {
        toValue: 1,
        tension: 80,
        friction: 8,
        delay: 400 + (index * 100),
        useNativeDriver: true,
      }).start();
    });
  };

  const handleMoodSelect = (moodIndex, moodData) => {
    setSelectedMood(moodIndex);
    
    // Animate selected mood
    Animated.sequence([
      Animated.spring(moodScales[moodIndex], {
        toValue: 1.2,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(moodScales[moodIndex], {
        toValue: 1.1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    // Reset other moods
    moodScales.forEach((scale, index) => {
      if (index !== moodIndex) {
        Animated.spring(scale, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }).start();
      }
    });
  };

  const moods = [
    { emoji: '😢', color: '#6B73FF', label: 'Sad', description: 'Feeling down today' },
    { emoji: '😐', color: '#9B59B6', label: 'Okay', description: 'Just getting by' },
    { emoji: '😊', color: '#4ECDC4', label: 'Good', description: 'Having a nice day' },
    { emoji: '😄', color: '#FFD93D', label: 'Happy', description: 'Feeling great!' },
    { emoji: '🤩', color: '#FF6B9D', label: 'Amazing', description: 'On top of the world!' },
  ];

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1A1A1A" barStyle="light-content" />
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
          <Text style={styles.date}>{formatDate(currentDate)}</Text>
        </Animated.View>

        {/* Main Question */}
        <Animated.View
          style={[
            styles.questionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.mainQuestion}>How are you feeling today?</Text>
          <Text style={styles.questionSubtext}>
            Select the mood that best describes how you're feeling right now
          </Text>
        </Animated.View>

        {/* Mood Selection */}
        <Animated.View
          style={[
            styles.moodContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {moods.map((mood, index) => (
            <Animated.View
              key={index}
              style={[
                styles.moodButtonContainer,
                {
                  transform: [{ scale: moodScales[index] }],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.moodButton,
                  {
                    backgroundColor: mood.color,
                    borderWidth: selectedMood === index ? 3 : 0,
                    borderColor: '#ffffff',
                  },
                ]}
                onPress={() => handleMoodSelect(index, mood)}
                activeOpacity={0.8}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              </TouchableOpacity>
              <Text style={styles.moodLabel}>{mood.label}</Text>
              {selectedMood === index && (
                <Text style={styles.moodDescription}>{mood.description}</Text>
              )}
            </Animated.View>
          ))}
        </Animated.View>

        {/* Continue Button */}
        {selectedMood !== null && (
          <Animated.View
            style={[
              styles.continueContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.continueButton,
                { backgroundColor: moods[selectedMood].color },
              ]}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <Text style={styles.continueButtonArrow}>→</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Stats Preview */}
        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.statsTitle}>Your Mood This Week</Text>
          <View style={styles.statsBar}>
            <View style={[styles.statSegment, { backgroundColor: '#6B73FF', flex: 1 }]} />
            <View style={[styles.statSegment, { backgroundColor: '#9B59B6', flex: 2 }]} />
            <View style={[styles.statSegment, { backgroundColor: '#4ECDC4', flex: 3 }]} />
            <View style={[styles.statSegment, { backgroundColor: '#FFD93D', flex: 2 }]} />
            <View style={[styles.statSegment, { backgroundColor: '#FF6B9D', flex: 1 }]} />
          </View>
          <Text style={styles.statsSubtext}>
            You've been feeling mostly good this week! 📈
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#b8b8c8',
    fontWeight: '400',
  },
  questionContainer: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    alignItems: 'center',
  },
  mainQuestion: {
    fontSize: 26,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  questionSubtext: {
    fontSize: 16,
    color: '#8a8a9a',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  moodContainer: {
    paddingHorizontal: 32,
    paddingVertical: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  moodButtonContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: width * 0.15,
  },
  moodButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  moodDescription: {
    fontSize: 12,
    color: '#8a8a9a',
    textAlign: 'center',
    lineHeight: 16,
  },
  continueContainer: {
    paddingHorizontal: 32,
    marginTop: 20,
  },
  continueButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
  },
  continueButtonArrow: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  statsContainer: {
    paddingHorizontal: 32,
    paddingVertical: 30,
    marginTop: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsBar: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 12,
  },
  statSegment: {
    height: '100%',
    marginRight: 2,
  },
  statsSubtext: {
    fontSize: 14,
    color: '#8a8a9a',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MainApp;