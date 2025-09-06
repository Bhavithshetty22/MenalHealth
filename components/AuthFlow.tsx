import React, { useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import SignInScreen from './SignInScreen';
import SignUpScreen from './SignUpScreen';

interface AuthFlowProps {
  onAuthComplete: () => void;
  initialView?: 'signin' | 'signup';
}

const AuthFlow: React.FC<AuthFlowProps> = ({ onAuthComplete, initialView = 'signup' }) => {
  const [currentView, setCurrentView] = useState<'signin' | 'signup'>(initialView);
  const [slideAnim] = useState(new Animated.Value(initialView === 'signup' ? 1 : 0));

  const switchToSignUp = () => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setCurrentView('signup');
  };

  const switchToSignIn = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setCurrentView('signin');
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '-50%'], // 0 = signin, 1 = signup (moves left to show signup)
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.screenContainer,
          { transform: [{ translateX }] }
        ]}
      >
        {/* Sign In Screen - First (Left) */}
        <View style={styles.screen}>
          <SignInScreen 
            onAuthComplete={onAuthComplete}
            onSwitchToSignUp={switchToSignUp}
          />
        </View>
        {/* Sign Up Screen - Second (Right) */}
        <View style={styles.screen}>
          <SignUpScreen 
            onAuthComplete={onAuthComplete}
            onSwitchToSignIn={switchToSignIn}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    overflow: 'hidden',
  },
  screenContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '200%', // Double width to hold both screens
  },
  screen: {
    flex: 1,
    width: '50%', // Each screen takes 50% of the container
  },
});

export default AuthFlow;