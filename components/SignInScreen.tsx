import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import Svg, { Path } from 'react-native-svg';

interface SignInScreenProps {
  onAuthComplete: () => void;
  onSwitchToSignUp: () => void;
}

// Google Icon Component
const GoogleIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
);

// Apple Icon Component
const AppleIcon = ({ size = 20, color = "#000000" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </Svg>
);

// Facebook Icon Component
const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      fill="#1877F2"
    />
  </Svg>
);

const SignInScreen: React.FC<SignInScreenProps> = ({ onAuthComplete, onSwitchToSignUp }) => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow: googleSignIn } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: appleSignIn } = useOAuth({ strategy: 'oauth_apple' });
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignInPress = async () => {
    if (!isLoaded || loading) return;

    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        onAuthComplete();
      } else {
        console.error('Sign in incomplete:', signInAttempt);
        Alert.alert('Error', 'Sign in incomplete. Please try again.');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      Alert.alert(
        'Sign In Failed', 
        err?.errors?.[0]?.message || 'Invalid email or password'
      );
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignInPress = async () => {
    setLoading(true);
    try {
      console.log('Starting Google Sign In...');
      
      const result = await googleSignIn();
      console.log('Google Sign In result:', result);

      if (result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        onAuthComplete();
      } else if (result.signIn?.createdSessionId) {
        await setActive({ session: result.signIn.createdSessionId });
        onAuthComplete();
      } else if (result.signUp?.createdSessionId) {
        await setActive({ session: result.signUp.createdSessionId });
        onAuthComplete();
      } else {
        Alert.alert('Sign In Error', 'Unable to complete Google sign in. Please try again.');
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);
      Alert.alert(
        'Google Sign In Failed',
        err?.errors?.[0]?.message || 'Failed to sign in with Google'
      );
    } finally {
      setLoading(false);
    }
  };

  const onAppleSignInPress = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Error', 'Apple Sign-In is only available on iOS devices');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting Apple Sign In...');
      
      const result = await appleSignIn();
      console.log('Apple Sign In result:', result);

      if (result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        onAuthComplete();
      } else if (result.signIn?.createdSessionId) {
        await setActive({ session: result.signIn.createdSessionId });
        onAuthComplete();
      } else if (result.signUp?.createdSessionId) {
        await setActive({ session: result.signUp.createdSessionId });
        onAuthComplete();
      } else {
        Alert.alert('Sign In Error', 'Unable to complete Apple sign in. Please try again.');
      }
    } catch (err: any) {
      console.error('Apple sign in error:', err);
      Alert.alert(
        'Apple Sign In Failed',
        err?.errors?.[0]?.message || 'Failed to sign in with Apple'
      );
    } finally {
      setLoading(false);
    }
  };

  const onFacebookSignInPress = async () => {
    Alert.alert('Info', 'Facebook sign-in not yet implemented');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder=""
              placeholderTextColor="#8E8E93"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder=""
              placeholderTextColor="#8E8E93"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={onSignInPress}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialContainer}>
          {/* Google Button */}
          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton, loading && styles.buttonDisabled]}
            onPress={onGoogleSignInPress}
            disabled={loading}
          >
            <GoogleIcon size={24} />
          </TouchableOpacity>

          {/* Apple Button */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.socialButton, styles.appleButton, loading && styles.buttonDisabled]}
              onPress={onAppleSignInPress}
              disabled={loading}
            >
              <AppleIcon size={24} color="#000000" />
            </TouchableOpacity>
          )}

          {/* Facebook Button */}
          <TouchableOpacity
            style={[styles.socialButton, styles.facebookButton, loading && styles.buttonDisabled]}
            onPress={onFacebookSignInPress}
            disabled={loading}
          >
            <FacebookIcon size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity onPress={onSwitchToSignUp}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8DCC0',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 40,
    paddingTop: 80,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 170,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B6B6B',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B6B6B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2C2C2C',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 16,
    color: '#FFFFFF',
    height: 45,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
    height: 60,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(44, 44, 44, 0.2)',
  },
  dividerText: {
    marginHorizontal: 20,
    fontSize: 14,
    color: '#6B6B6B',
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 30,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  appleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  facebookButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: '#2C2C2C',
    fontSize: 14,
  },
  signUpLink: {
    color: '#2C2C2C',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default SignInScreen;