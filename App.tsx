import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import IntroAnimation from './pages/IntroAnimation'; // Your intro animation
import WelcomePage from './pages/WelcomePage'; // The welcome page I created
import MainPage from './pages/MainPage'; // Your main app component

const AppFlow = () => {
  const [currentScreen, setCurrentScreen] = useState('intro');

  const handleIntroComplete = () => {
    console.log('Intro animation completed, showing welcome page');
    setCurrentScreen('welcome');
  };

  const handleWelcomeComplete = () => {
    console.log('Welcome page completed, showing main app');
    setCurrentScreen('main');
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'intro':
        return (
          <IntroAnimation 
            onAnimationComplete={handleIntroComplete}
          />
        );
      
      case 'welcome':
        return (
          <WelcomePage 
            onGetStarted={handleWelcomeComplete}
          />
        );
      
      case 'main':
        return (
          <MainPage />
        );
      
      default:
        return (
          <IntroAnimation 
            onAnimationComplete={handleIntroComplete}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        backgroundColor="#1A1A1A" 
        barStyle="light-content" 
        hidden={currentScreen === 'intro'}
      />
      {renderCurrentScreen()}
    </View>
  );
};

// Placeholder MainApp component - replace this with your actual main app
const MainApp = () => {
  return (
    <View style={styles.mainAppContainer}>
      {/* Your main app content goes here */}
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Your Main App Content
        </Text>
        <Text style={styles.placeholderSubtext}>
          "How are you feeling today?" screen and beyond...
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  mainAppContainer: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#b8b8c8',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AppFlow;