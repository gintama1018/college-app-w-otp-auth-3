"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, Mail, Phone, Lock, User, Check, X, Chrome, Microsoft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AuthScreenProps {
  onLogin: (credentials: { emailOrPhone: string; password: string; rememberMe: boolean }) => Promise<void>;
  onSignup: (userData: { 
    fullName: string; 
    email: string; 
    phoneNumber: string; 
    password: string; 
    agreeToTerms: boolean 
  }) => Promise<void>;
  onForgotPassword: () => void;
  isLoading?: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const countryCodes = [
  { code: '+1', country: 'US' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'IN' },
  { code: '+86', country: 'CN' },
  { code: '+81', country: 'JP' },
];

const getPasswordStrength = (password: string) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
};

const getPasswordStrengthLabel = (strength: number) => {
  switch (strength) {
    case 0:
    case 1:
      return { label: 'Weak', color: 'bg-red-500' };
    case 2:
      return { label: 'Fair', color: 'bg-orange-500' };
    case 3:
      return { label: 'Good', color: 'bg-yellow-500' };
    case 4:
    case 5:
      return { label: 'Strong', color: 'bg-green-500' };
    default:
      return { label: 'Weak', color: 'bg-red-500' };
  }
};

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string) => {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
};

const detectInputType = (value: string) => {
  if (isValidEmail(value)) return 'email';
  if (isValidPhone(value)) return 'phone';
  return 'unknown';
};

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLogin,
  onSignup,
  onForgotPassword,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    emailOrPhone: '',
    password: '',
    rememberMe: false
  });

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    countryCode: '+1',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const validateLoginForm = () => {
    const newErrors: FormErrors = {};

    if (!loginForm.emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Email or phone number is required';
    } else if (detectInputType(loginForm.emailOrPhone) === 'unknown') {
      newErrors.emailOrPhone = 'Please enter a valid email or phone number';
    }

    if (!loginForm.password) {
      newErrors.password = 'Password is required';
    } else if (loginForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignupForm = () => {
    const newErrors: FormErrors = {};

    if (!signupForm.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!signupForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(signupForm.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!signupForm.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!isValidPhone(signupForm.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!signupForm.password) {
      newErrors.password = 'Password is required';
    } else if (signupForm.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!signupForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (signupForm.password !== signupForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!signupForm.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setLoading(true);
    try {
      await onLogin(loginForm);
    } catch (error) {
      setErrors({ general: 'Login failed. Please check your credentials.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignupForm()) return;

    setLoading(true);
    try {
      await onSignup({
        ...signupForm,
        phoneNumber: `${signupForm.countryCode}${signupForm.phoneNumber}`
      });
    } catch (error) {
      setErrors({ general: 'Signup failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    if (activeTab === 'login') {
      setLoginForm(prev => ({ ...prev, [field]: value }));
    } else {
      setSignupForm(prev => ({ ...prev, [field]: value }));
    }
    
    setTouched(prev => ({ ...prev, [field]: true }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const passwordStrength = getPasswordStrength(signupForm.password);
  const strengthInfo = getPasswordStrengthLabel(passwordStrength);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Welcome
              </CardTitle>
            </motion.div>

            {/* Tab Toggle */}
            <div className="relative flex bg-muted rounded-lg p-1">
              <motion.div
                layout
                className="absolute inset-y-1 bg-white rounded-md shadow-sm"
                style={{
                  width: '50%',
                  x: activeTab === 'login' ? '0%' : '100%'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`relative flex-1 py-2 text-sm font-medium transition-colors z-10 ${
                  activeTab === 'login' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`relative flex-1 py-2 text-sm font-medium transition-colors z-10 ${
                  activeTab === 'signup' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Sign Up
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Social Login Buttons */}
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-3 hover:bg-gray-50 transition-colors"
                type="button"
              >
                <Chrome className="w-4 h-4" />
                Continue with Google
              </Button>
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-3 hover:bg-gray-50 transition-colors"
                type="button"
              >
                <Microsoft className="w-4 h-4" />
                Continue with Microsoft
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  {/* Email or Phone Input */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Email or Phone Number"
                        value={loginForm.emailOrPhone}
                        onChange={(e) => handleInputChange('emailOrPhone', e.target.value)}
                        className={`pl-10 ${errors.emailOrPhone ? 'border-destructive' : ''}`}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        {detectInputType(loginForm.emailOrPhone) === 'email' ? (
                          <Mail className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Phone className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    {errors.emailOrPhone && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-destructive flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        {errors.emailOrPhone}
                      </motion.p>
                    )}
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={loginForm.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-destructive flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        {errors.password}
                      </motion.p>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        checked={loginForm.rememberMe}
                        onCheckedChange={(checked) => handleInputChange('rememberMe', checked)}
                      />
                      <label htmlFor="rememberMe" className="text-sm text-muted-foreground">
                        Remember me
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={onForgotPassword}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {errors.general && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-destructive text-center"
                    >
                      {errors.general}
                    </motion.p>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || isLoading}
                  >
                    {loading || isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSignup}
                  className="space-y-4"
                >
                  {/* Full Name */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Full Name"
                        value={signupForm.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className={`pl-10 ${errors.fullName ? 'border-destructive' : ''}`}
                      />
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                    {errors.fullName && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-destructive flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        {errors.fullName}
                      </motion.p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="Email Address"
                        value={signupForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-destructive flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Select
                        value={signupForm.countryCode}
                        onValueChange={(value) => handleInputChange('countryCode', value)}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="relative flex-1">
                        <Input
                          type="tel"
                          placeholder="Phone Number"
                          value={signupForm.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          className={`pl-10 ${errors.phoneNumber ? 'border-destructive' : ''}`}
                        />
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    {errors.phoneNumber && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-destructive flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        {errors.phoneNumber}
                      </motion.p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={signupForm.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {signupForm.password && (
                      <div className="space-y-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                level <= passwordStrength ? strengthInfo.color : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Password strength: <span className="font-medium">{strengthInfo.label}</span>
                        </p>
                      </div>
                    )}

                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-destructive flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        {errors.password}
                      </motion.p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm Password"
                        value={signupForm.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {signupForm.confirmPassword && signupForm.password === signupForm.confirmPassword && (
                        <Check className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                      )}
                    </div>
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-destructive flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </div>

                  {/* Terms and Conditions */}
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreeToTerms"
                        checked={signupForm.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
                      />
                      <label htmlFor="agreeToTerms" className="text-sm text-muted-foreground leading-relaxed">
                        I agree to the{' '}
                        <button type="button" className="text-primary hover:underline">
                          Terms of Service
                        </button>{' '}
                        and{' '}
                        <button type="button" className="text-primary hover:underline">
                          Privacy Policy
                        </button>
                      </label>
                    </div>
                    {errors.agreeToTerms && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-destructive flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        {errors.agreeToTerms}
                      </motion.p>
                    )}
                  </div>

                  {errors.general && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-destructive text-center"
                    >
                      {errors.general}
                    </motion.p>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || isLoading}
                  >
                    {loading || isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};