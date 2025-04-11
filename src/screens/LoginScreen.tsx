
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Moon, Mail, Lock, User } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demopassword');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

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
      navigate('/onboarding');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ email: 'Failed to create account' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-purple-600">FinWise</h1>
        <button 
          className="p-2 bg-gray-100 rounded-lg"
          onClick={() => console.log('Theme toggle pressed')}
        >
          <Moon className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-md w-full mx-auto">
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-4 text-center ${
              activeTab === 'login' 
                ? 'text-purple-600 border-b-2 border-purple-600 font-medium' 
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`flex-1 py-4 text-center ${
              activeTab === 'register' 
                ? 'text-purple-600 border-b-2 border-purple-600 font-medium' 
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'login' ? (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome back</h2>
              <p className="text-gray-500 mb-6">
                Enter your credentials below to access your account
              </p>

              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                error={errors.email}
                leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                error={errors.password}
                leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
              />

              <div className="flex justify-end mb-6">
                <button className="text-sm text-purple-600">
                  Forgot password?
                </button>
              </div>

              <button
                className={`w-full py-3 rounded-lg font-medium ${
                  isSubmitting 
                    ? 'bg-purple-400 text-white' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
                onClick={handleLogin}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Create an account</h2>
              <p className="text-gray-500 mb-6">
                Enter your information to get started
              </p>

              <Input
                label="Full Name"
                value={name}
                onChangeText={setName}
                placeholder="John Doe"
                error={errors.name}
                leftIcon={<User className="w-5 h-5 text-gray-400" />}
              />

              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                error={errors.email}
                leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                error={errors.password}
                leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
              />

              <button
                className={`w-full py-3 rounded-lg font-medium ${
                  isSubmitting 
                    ? 'bg-purple-400 text-white' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
                onClick={handleRegister}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-500 mb-2">
          Demo credentials are pre-filled for you.
        </p>
        <button
          className="text-purple-600 font-medium"
          onClick={() => {
            setEmail('demo@example.com');
            setPassword('demopassword');
            setActiveTab('login');
          }}
        >
          Use demo account
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
