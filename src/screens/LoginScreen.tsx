
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Feather } from '@expo/vector-icons';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demopassword');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  
  const { login, register } = useAuth();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; name?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (activeTab === 'register' && !name) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await login(email, password);
      // Navigation will be handled by the app navigator
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ email: 'Invalid email or password' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await register({ name, email });
      navigation.navigate('Onboarding');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ email: 'Failed to create account' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.appName}>FinWise</Text>
            <TouchableOpacity 
              style={styles.themeToggle}
              onPress={() => console.log('Theme toggle pressed')}
            >
              <Feather name="moon" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'login' && styles.activeTab]}
                onPress={() => setActiveTab('login')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'login' && styles.activeTabText,
                  ]}
                >
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'register' && styles.activeTab]}
                onPress={() => setActiveTab('register')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'register' && styles.activeTabText,
                  ]}
                >
                  Register
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'login' ? (
              <View style={styles.form}>
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>
                  Enter your credentials below to access your account
                </Text>

                <Input
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  error={errors.email}
                  leftIcon={<Feather name="mail" size={18} color="#6B7280" />}
                />

                <Input
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry
                  error={errors.password}
                  leftIcon={<Feather name="lock" size={18} color="#6B7280" />}
                />

                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>

                <Button
                  title={isSubmitting ? 'Logging in...' : 'Login'}
                  onPress={handleLogin}
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  style={styles.button}
                />
              </View>
            ) : (
              <View style={styles.form}>
                <Text style={styles.title}>Create an account</Text>
                <Text style={styles.subtitle}>
                  Enter your information to get started
                </Text>

                <Input
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                  placeholder="John Doe"
                  error={errors.name}
                  leftIcon={<Feather name="user" size={18} color="#6B7280" />}
                />

                <Input
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  error={errors.email}
                  leftIcon={<Feather name="mail" size={18} color="#6B7280" />}
                />

                <Input
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry
                  error={errors.password}
                  leftIcon={<Feather name="lock" size={18} color="#6B7280" />}
                />

                <Button
                  title={isSubmitting ? 'Creating account...' : 'Create account'}
                  onPress={handleRegister}
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  style={styles.button}
                />
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Demo credentials are pre-filled for you.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setEmail('demo@example.com');
                setPassword('demopassword');
                setActiveTab('login');
              }}
            >
              <Text style={styles.demoLink}>Use demo account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  themeToggle: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#8B5CF6',
  },
  form: {
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#8B5CF6',
  },
  button: {
    marginTop: 8,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  demoLink: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
});

export default LoginScreen;
