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
  ImageBackground,
} from 'react-native';
import { useSignUp, useOAuth } from '@clerk/clerk-expo';
import Svg, { Path, G, Defs, ClipPath, Rect } from 'react-native-svg';

interface SignUpScreenProps {
  onAuthComplete: () => void;
  onSwitchToSignIn: () => void;
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

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onAuthComplete, onSwitchToSignIn }) => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startOAuthFlow: googleSignUp } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: appleSignUp } = useOAuth({ strategy: 'oauth_apple' });
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');

  const onSignUpPress = async () => {
    if (!isLoaded || loading) return;

    if (!email || !password) {
      Alert.alert('Error', 'Please fill in email and password fields');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const signUpData = {
        emailAddress: email,
        password,
      };

      await signUp.create(signUpData);
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error('Sign up error:', err);
      Alert.alert(
        'Sign Up Failed',
        err?.errors?.[0]?.message || 'Please check your information and try again'
      );
    } finally {
      setLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded || loading) return;

    if (!code) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setLoading(true);

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        onAuthComplete();
      } else {
        console.error('Verification incomplete:', signUpAttempt);
        Alert.alert('Error', 'Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      Alert.alert(
        'Verification Failed',
        err?.errors?.[0]?.message || 'Invalid verification code'
      );
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignUpPress = async () => {
    setLoading(true);
    try {
      console.log('Starting Google OAuth flow...');
      
      const result = await googleSignUp();
      console.log('Google OAuth result:', result);

      // Check different possible result structures
      if (result.createdSessionId) {
        console.log('Found createdSessionId:', result.createdSessionId);
        await setActive({ session: result.createdSessionId });
        console.log('Session set successfully');
        onAuthComplete();
      } else if (result.signUp?.createdSessionId) {
        console.log('Found signUp.createdSessionId:', result.signUp.createdSessionId);
        await setActive({ session: result.signUp.createdSessionId });
        console.log('Session set successfully');
        onAuthComplete();
      } else if (result.signIn?.createdSessionId) {
        console.log('Found signIn.createdSessionId:', result.signIn.createdSessionId);
        await setActive({ session: result.signIn.createdSessionId });
        console.log('Session set successfully');
        onAuthComplete();
      } else {
        console.error('No session ID found in result:', result);
        Alert.alert(
          'Authentication Error',
          'Authentication was successful but no session was created. Please try again.'
        );
      }
    } catch (err: any) {
      console.error('Google sign up error:', err);
      console.error('Error details:', {
        message: err.message,
        errors: err.errors,
        code: err.code,
        stack: err.stack
      });
      
      // Handle specific error cases
      if (err.code === 'oauth_access_denied') {
        Alert.alert(
          'Access Denied',
          'Google sign-in was cancelled. Please try again.'
        );
      } else if (err.code === 'oauth_error') {
        Alert.alert(
          'OAuth Error',
          'There was an issue with Google authentication. Please try again or use email sign-up.'
        );
      } else {
        Alert.alert(
          'Google Sign Up Failed',
          err?.errors?.[0]?.message || err.message || 'Failed to sign up with Google. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const onAppleSignUpPress = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Error', 'Apple Sign-In is only available on iOS devices');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting Apple OAuth flow...');
      
      const result = await appleSignUp();
      console.log('Apple OAuth result:', result);

      // Check if we have a complete session first
      if (result.createdSessionId) {
        console.log('Found createdSessionId:', result.createdSessionId);
        await setActive({ session: result.createdSessionId });
        console.log('Session set successfully');
        onAuthComplete();
        return;
      }

      // Check if sign in was successful
      if (result.signIn?.createdSessionId) {
        console.log('Found signIn.createdSessionId:', result.signIn.createdSessionId);
        await setActive({ session: result.signIn.createdSessionId });
        console.log('Session set successfully');
        onAuthComplete();
        return;
      }

      // Handle sign up case - check if we need to complete the signup
      if (result.signUp) {
        const signUpObj = result.signUp;
        console.log('SignUp object status:', signUpObj._status);
        console.log('Missing fields:', signUpObj.missingFields);

        // If signUp is complete
        if (signUpObj.createdSessionId) {
          console.log('Found signUp.createdSessionId:', signUpObj.createdSessionId);
          await setActive({ session: signUpObj.createdSessionId });
          console.log('Session set successfully');
          onAuthComplete();
          return;
        }

        // If signUp needs phone number, try to complete it without phone number
        if (signUpObj._status === 'missing_requirements' && signUpObj.missingFields?.includes('phone_number')) {
          try {
            console.log('Attempting to complete Apple signUp without phone number...');
            
            // Try to update the signup to complete it
            const updatedSignUp = await signUpObj.update({});
            
            if (updatedSignUp.createdSessionId) {
              await setActive({ session: updatedSignUp.createdSessionId });
              console.log('Session set successfully after update');
              onAuthComplete();
              return;
            }
          } catch (updateError) {
            console.log('Apple update attempt failed:', updateError);
          }
        }
      }

      // If we get here, something went wrong
      console.error('No valid Apple session found in result:', result);
      Alert.alert(
        'Setup Required',
        'Apple authentication was successful, but additional setup is required. Please use email signup or contact support.'
      );
      
    } catch (err: any) {
      console.error('Apple sign up error:', err);
      Alert.alert(
        'Apple Sign Up Failed',
        err?.errors?.[0]?.message || 'Failed to sign up with Apple'
      );
    } finally {
      setLoading(false);
    }
  };

  const onFacebookSignUpPress = async () => {
    // Placeholder for Facebook OAuth - you'll need to implement this
    Alert.alert('Info', 'Facebook sign-up not yet implemented');
  };

  if (pendingVerification) {
    return (
      <ImageBackground
        source={require('../assets/welcome.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Verify Your Email</Text>
              <Text style={styles.subtitle}>
                We've sent a verification code to {email}
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Verification Code"
                  placeholderTextColor="#8E8E93"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={onVerifyPress}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? 'Verifying...' : 'Verify Email'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footerContainer}>
              <TouchableOpacity onPress={() => setPendingVerification(false)}>
                <Text style={styles.backText}>← Back to Sign Up</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/welcome.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us and start your journey</Text>
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
                autoComplete="new-password"
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={onSignUpPress}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Creating Account...' : 'Sign Up'}
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
              onPress={onGoogleSignUpPress}
              disabled={loading}
            >
              <GoogleIcon size={24} />
            </TouchableOpacity>

            {/* Apple Button */}
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.socialButton, styles.appleButton, loading && styles.buttonDisabled]}
                onPress={onAppleSignUpPress}
                disabled={loading}
              >
                <AppleIcon size={24} color="#000000" />
              </TouchableOpacity>
            )}

            {/* Facebook Button */}
            <TouchableOpacity
              style={[styles.socialButton, styles.facebookButton, loading && styles.buttonDisabled]}
              onPress={onFacebookSignUpPress}
              disabled={loading}
            >
              <FacebookIcon size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={onSwitchToSignIn}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Make container transparent to show background
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
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    color: '#2C2C2C',
    fontSize: 14,
  },
  signInLink: {
    color: '#2C2C2C',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  backText: {
    color: '#2C2C2C',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
});

export default SignUpScreen;