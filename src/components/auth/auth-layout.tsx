"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

const FloatingParticle = ({ index }: { index: number }) => {
  return (
    <motion.div
      className="absolute rounded-full bg-gradient-to-r from-blue-400/20 to-indigo-400/20 backdrop-blur-sm"
      style={{
        width: Math.random() * 6 + 4,
        height: Math.random() * 6 + 4,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, Math.random() * 20 - 10, 0],
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.8, 0.3],
      }}
      transition={{
        duration: 4 + Math.random() * 4,
        repeat: Infinity,
        delay: index * 0.2,
        ease: "easeInOut",
      }}
    />
  );
};

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
      
      {/* Animated Gradient Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-indigo-400/10 to-purple-400/10"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          backgroundSize: '400% 400%',
        }}
      />
      
      {/* Floating Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <FloatingParticle key={i} index={i} />
      ))}
      
      {/* Large Background Shapes */}
      <motion.div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-blue-200/20 to-indigo-200/20 backdrop-blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-purple-200/20 to-pink-200/20 backdrop-blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, -90, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

const BrandingSection = () => {
  return (
    <motion.div
      className="hidden lg:flex flex-col justify-center items-center p-8 text-center"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <motion.div
        className="mb-8"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">EduPortal</h1>
        <p className="text-gray-600">Your Academic Journey Starts Here</p>
      </motion.div>
      
      <motion.div
        className="space-y-4 text-gray-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span>Seamless Learning Experience</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-indigo-500 rounded-full" />
          <span>Advanced Analytics & Insights</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-purple-500 rounded-full" />
          <span>AI-Powered Study Assistant</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const AuthLayout = ({ 
  children, 
  title, 
  subtitle, 
  showBackButton = false, 
  onBack 
}: AuthLayoutProps) => {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <AnimatedBackground />
      
      <motion.div
        className="relative w-full max-w-6xl mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div className="grid lg:grid-cols-5 min-h-[600px]">
            {/* Branding Section - Left Side */}
            <div className="lg:col-span-2 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 relative">
              <BrandingSection />
            </div>
            
            {/* Form Section - Right Side */}
            <div className="lg:col-span-3 p-8 lg:p-12 flex flex-col justify-center">
              {/* Back Button */}
              {showBackButton && onBack && (
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="text-gray-600 hover:text-gray-800 transition-colors p-2 hover:bg-gray-100/80 rounded-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </motion.div>
              )}
              
              {/* Header */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
                {subtitle && (
                  <p className="text-gray-600 text-lg">{subtitle}</p>
                )}
              </motion.div>
              
              {/* Content */}
              <motion.div
                className="flex-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {children}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Mobile Logo */}
      <motion.div
        className="lg:hidden absolute top-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800">EduPortal</span>
        </div>
      </motion.div>
    </div>
  );
};