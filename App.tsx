import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Text } from 'react-native';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';

// Your existing components
import IntroAnimation from './pages/IntroAnimation';
import WelcomePage from './pages/WelcomePage';
import MainPage from './pages/MainPage';

// New auth components we'll create
import AuthFlow from './components/AuthFlow';

const AppFlow = () => {
  const [currentScreen, setCurrentScreen] = useState('intro');
  const [authInitialView, setAuthInitialView] = useState<'signin' | 'signup'>('signup');
  const { isSignedIn, isLoaded } = useAuth();

  const handleIntroComplete = () => {
    console.log('Intro animation completed');
    // Check if user is authenticated after intro
    if (isLoaded) {
      if (isSignedIn) {
        setCurrentScreen('main');
      } else {
        setCurrentScreen('welcome'); // Show welcome page first
      }
    } else {
      setCurrentScreen('welcome');
    }
  };

  const handleWelcomeComplete = () => {
    console.log('Get Started pressed, going to auth');
    setAuthInitialView('signup'); // Set to signup for "Get Started"
    setCurrentScreen('auth');
  };

  const handleLoginFromWelcome = () => {
    console.log('Login pressed from welcome page');
    setAuthInitialView('signin'); // Set to signin for "Log In"
    setCurrentScreen('auth');
  };

  const handleAuthComplete = () => {
    console.log('Authentication completed');
    setCurrentScreen('main');
  };

  const renderCurrentScreen = () => {
    // Show loading while Clerk is initializing
    if (!isLoaded && currentScreen !== 'intro') {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

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
            onLogin={handleLoginFromWelcome}
          />
        );
      
      case 'auth':
        return (
          <AuthFlow 
            onAuthComplete={handleAuthComplete}
            initialView={authInitialView}
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

// Main App wrapper with ClerkProvider
const App = () => {
  return (
    <ClerkProvider 
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <AppFlow />
    </ClerkProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default App;