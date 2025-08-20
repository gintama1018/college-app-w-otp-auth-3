"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, Loader2, RefreshCw, Smartphone } from 'lucide-react';

interface OTPVerificationProps {
  phoneNumber: string;
  email?: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack?: () => void;
  isLoading?: boolean;
}

type VerificationState = 'initial' | 'loading' | 'success' | 'error';

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  phoneNumber,
  email,
  onVerify,
  onResend,
  onBack,
  isLoading = false
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [state, setState] = useState<VerificationState>('initial');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-submit when all digits are entered
  useEffect(() => {
    const otpString = otp.join('');
    if (otpString.length === 6 && state === 'initial') {
      handleVerify(otpString);
    }
  }, [otp, state]);

  const handleVerify = async (otpString: string) => {
    setState('loading');
    try {
      await onVerify(otpString);
      setState('success');
    } catch (error) {
      setState('error');
      // Clear OTP on error
      setTimeout(() => {
        setOtp(new Array(6).fill(''));
        setState('initial');
        inputRefs.current[0]?.focus();
      }, 1000);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last digit
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otp];
      
      if (otp[index]) {
        // Clear current input
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous input and clear it
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    
    setIsResending(true);
    try {
      await onResend();
      setResendCooldown(30);
      setOtp(new Array(6).fill(''));
      setState('initial');
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error('Failed to resend OTP:', error);
    } finally {
      setIsResending(false);
    }
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const inputVariants = {
    initial: { scale: 1 },
    focus: { scale: 1.05 },
    error: { 
      x: [-10, 10, -10, 10, 0],
      transition: { duration: 0.4 }
    },
    success: {
      scale: [1, 1.1, 1],
      backgroundColor: "#10B981",
      color: "#FFFFFF",
      transition: { duration: 0.3 }
    }
  };

  const successVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-between mb-4">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex-1" />
          </div>
          
          <motion.div
            className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4"
            animate={{
              scale: state === 'success' ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {state === 'success' ? (
                <motion.div
                  key="success"
                  variants={successVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Check className="h-8 w-8 text-white" />
                </motion.div>
              ) : (
                <motion.div key="phone" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Smartphone className="h-8 w-8 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <CardTitle className="text-2xl font-bold text-gray-900">
            {state === 'success' ? 'Verified!' : 'Verify your phone'}
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            {state === 'success' 
              ? 'Your phone number has been successfully verified'
              : `We've sent a 6-digit code to ${phoneNumber}${email ? ` and ${email}` : ''}`
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <AnimatePresence mode="wait">
            {state !== 'success' ? (
              <motion.div
                key="otp-input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* OTP Input */}
                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <motion.input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      onFocus={() => setState('initial')}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 bg-white"
                      variants={inputVariants}
                      animate={
                        state === 'error' ? 'error' :
                        state === 'success' ? 'success' :
                        digit ? 'focus' : 'initial'
                      }
                      whileFocus="focus"
                      disabled={state === 'loading' || state === 'success'}
                    />
                  ))}
                </div>

                {/* Loading State */}
                <AnimatePresence>
                  {state === 'loading' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center gap-2 text-blue-600"
                    >
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm font-medium">Verifying...</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error State */}
                <AnimatePresence>
                  {state === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center text-red-600 text-sm font-medium"
                    >
                      Invalid OTP. Please try again.
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Resend Button */}
                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    Didn't receive the code?{' '}
                  </span>
                  <Button
                    variant="link"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || isResending}
                    className="p-0 h-auto font-medium text-blue-600 hover:text-blue-700"
                  >
                    {isResending ? (
                      <span className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        Sending...
                      </span>
                    ) : resendCooldown > 0 ? (
                      `Resend in ${resendCooldown}s`
                    ) : (
                      'Resend code'
                    )}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success-message"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Check className="h-4 w-4" />
                  Phone number verified successfully
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};