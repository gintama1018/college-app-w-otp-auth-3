"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

// Types
interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
}

interface AuthData {
  email?: string;
  phone?: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

type AuthState = 'initial' | 'login' | 'signup' | 'otp-verification' | 'authenticated';

interface AuthManagerProps {
  onAuthenticated: (user: User) => void;
  onLogout: () => void;
  initialAuthState?: 'login' | 'signup';
}

interface AuthError {
  message: string;
  field?: string;
}

// Mock API functions
const authAPI = {
  login: async (email: string, password: string): Promise<{ user: User; token: string; requiresOTP: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (email === 'test@error.com') {
      throw new Error('Invalid credentials');
    }
    
    const user: User = {
      id: '1',
      email,
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date()
    };
    
    return {
      user,
      token: 'mock-jwt-token',
      requiresOTP: email === 'test@otp.com'
    };
  },

  signup: async (data: AuthData): Promise<{ user: User; token: string; requiresOTP: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (data.email === 'test@exists.com') {
      throw new Error('User already exists');
    }
    
    const user: User = {
      id: '2',
      email: data.email!,
      phone: data.phone,
      firstName: data.firstName!,
      lastName: data.lastName!,
      createdAt: new Date()
    };
    
    return {
      user,
      token: 'mock-jwt-token',
      requiresOTP: true
    };
  },

  verifyOTP: async (code: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (code === '000000') {
      throw new Error('Invalid OTP code');
    }
    
    return { success: true };
  },

  resendOTP: async (): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }
};

// Storage utilities
const storage = {
  setAuthData: (user: User, token: string) => {
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_timestamp', Date.now().toString());
  },
  
  getAuthData: (): { user: User; token: string } | null => {
    try {
      const user = localStorage.getItem('auth_user');
      const token = localStorage.getItem('auth_token');
      const timestamp = localStorage.getItem('auth_timestamp');
      
      if (!user || !token || !timestamp) return null;
      
      // Check if token is expired (24 hours)
      const now = Date.now();
      const authTime = parseInt(timestamp);
      if (now - authTime > 24 * 60 * 60 * 1000) {
        storage.clearAuthData();
        return null;
      }
      
      return { user: JSON.parse(user), token };
    } catch {
      return null;
    }
  },
  
  clearAuthData: () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_timestamp');
  }
};

// Auth Screen Component (Login/Signup selector)
const AuthScreen: React.FC<{
  onSelectLogin: () => void;
  onSelectSignup: () => void;
}> = ({ onSelectLogin, onSelectSignup }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 text-center"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
        <p className="text-gray-600">Choose how you'd like to continue</p>
      </div>
      
      <div className="space-y-4">
        <Button
          onClick={onSelectLogin}
          className="w-full h-12 text-lg"
          size="lg"
        >
          Sign In
        </Button>
        
        <Button
          onClick={onSelectSignup}
          variant="outline"
          className="w-full h-12 text-lg"
          size="lg"
        >
          Create Account
        </Button>
      </div>
    </motion.div>
  );
};

// Login Form Component
const LoginForm: React.FC<{
  onSubmit: (email: string, password: string) => void;
  onBack: () => void;
  loading: boolean;
  error: AuthError | null;
}> = ({ onSubmit, onBack, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
          <p className="text-gray-600">Welcome back! Please sign in to your account</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter your password"
            required
            disabled={loading}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </motion.div>
  );
};

// Signup Form Component
const SignupForm: React.FC<{
  onSubmit: (data: AuthData) => void;
  onBack: () => void;
  loading: boolean;
  error: AuthError | null;
}> = ({ onSubmit, onBack, loading, error }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return;
    }
    onSubmit({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600">Sign up to get started with your account</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="John"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Doe"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="john.doe@example.com"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700">
            Phone (Optional)
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange('phone')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="+1 (555) 000-0000"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange('password')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter your password"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Confirm your password"
            required
            disabled={loading}
          />
        </div>

        {formData.password !== formData.confirmPassword && formData.confirmPassword && (
          <p className="text-sm text-red-600">Passwords do not match</p>
        )}

        <Button
          type="submit"
          className="w-full h-12"
          disabled={loading || formData.password !== formData.confirmPassword}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>
    </motion.div>
  );
};

// OTP Verification Component
const OTPVerification: React.FC<{
  onVerify: (code: string) => void;
  onResend: () => void;
  onBack: () => void;
  loading: boolean;
  resendLoading: boolean;
  error: AuthError | null;
  email?: string;
  phone?: string;
}> = ({ onVerify, onResend, onBack, loading, resendLoading, error, email, phone }) => {
  const [code, setCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      onVerify(code);
    }
  };

  const handleResend = () => {
    onResend();
    setResendTimer(30);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verify Code</h1>
          <p className="text-gray-600">
            We sent a verification code to {email || phone}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="otp" className="text-sm font-medium text-gray-700">
            Verification Code
          </label>
          <input
            id="otp"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-3 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="000000"
            maxLength={6}
            required
            disabled={loading}
          />
          <p className="text-xs text-gray-500">Enter the 6-digit code</p>
        </div>

        <Button
          type="submit"
          className="w-full h-12"
          disabled={loading || code.length !== 6}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Code'
          )}
        </Button>

        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={handleResend}
            disabled={resendTimer > 0 || resendLoading}
            className="text-sm"
          >
            {resendLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Sending...
              </>
            ) : resendTimer > 0 ? (
              `Resend code in ${resendTimer}s`
            ) : (
              'Resend code'
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

// Auth Layout Component
const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-xl border border-gray-200 p-8"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

// Main Authentication Manager Component
export const AuthManager: React.FC<AuthManagerProps> = ({
  onAuthenticated,
  onLogout,
  initialAuthState = 'login'
}) => {
  const [authState, setAuthState] = useState<AuthState>('initial');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState<{ email?: string; phone?: string }>({});

  // Check for existing authentication on mount
  useEffect(() => {
    const authData = storage.getAuthData();
    if (authData) {
      setAuthState('authenticated');
      onAuthenticated(authData.user);
    } else {
      setAuthState(initialAuthState === 'login' ? 'initial' : initialAuthState);
    }
  }, [initialAuthState, onAuthenticated]);

  // Clear error when state changes
  useEffect(() => {
    setError(null);
  }, [authState]);

  const handleLogin = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authAPI.login(email, password);
      
      if (result.requiresOTP) {
        setPendingUser(result.user);
        setPendingToken(result.token);
        setContactInfo({ email });
        setAuthState('otp-verification');
        toast.success('Verification code sent to your email');
      } else {
        storage.setAuthData(result.user, result.token);
        setAuthState('authenticated');
        onAuthenticated(result.user);
        toast.success('Welcome back!');
      }
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : 'Login failed' });
    } finally {
      setLoading(false);
    }
  }, [onAuthenticated]);

  const handleSignup = useCallback(async (data: AuthData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authAPI.signup(data);
      
      setPendingUser(result.user);
      setPendingToken(result.token);
      setContactInfo({ email: data.email, phone: data.phone });
      setAuthState('otp-verification');
      toast.success('Account created! Please verify your email.');
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : 'Signup failed' });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOTPVerify = useCallback(async (code: string) => {
    if (!pendingUser || !pendingToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await authAPI.verifyOTP(code);
      
      storage.setAuthData(pendingUser, pendingToken);
      setAuthState('authenticated');
      onAuthenticated(pendingUser);
      
      // Success animation
      toast.success(
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span>Account verified successfully!</span>
        </div>
      );
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : 'Verification failed' });
    } finally {
      setLoading(false);
    }
  }, [pendingUser, pendingToken, onAuthenticated]);

  const handleResendOTP = useCallback(async () => {
    setResendLoading(true);
    setError(null);
    
    try {
      await authAPI.resendOTP();
      toast.success('Verification code sent!');
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : 'Failed to resend code' });
    } finally {
      setResendLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    storage.clearAuthData();
    setAuthState('initial');
    setPendingUser(null);
    setPendingToken(null);
    setContactInfo({});
    setError(null);
    onLogout();
    toast.success('Signed out successfully');
  }, [onLogout]);

  const handleBack = useCallback(() => {
    if (authState === 'login' || authState === 'signup') {
      setAuthState('initial');
    } else if (authState === 'otp-verification') {
      // Go back to the previous auth state
      setAuthState(pendingUser?.id === '2' ? 'signup' : 'login');
    }
    setError(null);
  }, [authState, pendingUser]);

  // Don't render anything if authenticated (parent should handle this)
  if (authState === 'authenticated') {
    return null;
  }

  return (
    <AuthLayout>
      <AnimatePresence mode="wait">
        {authState === 'initial' && (
          <AuthScreen
            key="initial"
            onSelectLogin={() => setAuthState('login')}
            onSelectSignup={() => setAuthState('signup')}
          />
        )}
        
        {authState === 'login' && (
          <LoginForm
            key="login"
            onSubmit={handleLogin}
            onBack={handleBack}
            loading={loading}
            error={error}
          />
        )}
        
        {authState === 'signup' && (
          <SignupForm
            key="signup"
            onSubmit={handleSignup}
            onBack={handleBack}
            loading={loading}
            error={error}
          />
        )}
        
        {authState === 'otp-verification' && (
          <OTPVerification
            key="otp"
            onVerify={handleOTPVerify}
            onResend={handleResendOTP}
            onBack={handleBack}
            loading={loading}
            resendLoading={resendLoading}
            error={error}
            email={contactInfo.email}
            phone={contactInfo.phone}
          />
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};