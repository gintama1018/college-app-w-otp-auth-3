"use client"

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface OtpVerificationProps {
  phoneNumber: string
  onBack?: () => void
  onVerify: (otp: string) => Promise<void>
  onResend: () => Promise<void>
  resendCooldown?: number
}

export default function OtpVerification({
  phoneNumber,
  onBack,
  onVerify,
  onResend,
  resendCooldown = 30
}: OtpVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(resendCooldown)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleInputChange = async (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && value !== '') {
      await handleVerify(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('')
    if (code.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await onVerify(code)
    } catch (err) {
      setError('Invalid OTP. Please try again.')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return

    try {
      await onResend()
      setTimeRemaining(resendCooldown)
      setCanResend(false)
      setOtp(['', '', '', '', '', ''])
      setError('')
      inputRefs.current[0]?.focus()
    } catch (err) {
      setError('Failed to resend OTP. Please try again.')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const maskPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length >= 10) {
      return `+${cleaned.slice(0, -10)}${'*'.repeat(6)}${cleaned.slice(-4)}`
    }
    return phone
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-surface">
        <CardHeader className="space-y-0 pb-6">
          <div className="flex items-center justify-between mb-6">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2 h-auto"
                disabled={isLoading}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center space-x-2 ml-auto">
              <div className="w-2 h-2 bg-muted rounded-full" />
              <div className="w-2 h-2 bg-primary rounded-full" />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold font-display text-foreground">
              Verify Your Phone
            </h1>
            <p className="text-muted-foreground">
              We've sent a 6-digit code to
            </p>
            <p className="font-medium text-foreground">
              {maskPhoneNumber(phoneNumber)}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-semibold border-2 focus:border-primary"
                  disabled={isLoading}
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>

            {error && (
              <div className="text-center">
                <p className="text-sm text-error font-medium">{error}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => handleVerify()}
              disabled={otp.some(digit => digit === '') || isLoading}
              className="w-full h-12 font-medium"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?
              </p>
              
              {!canResend ? (
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Resend in {formatTime(timeRemaining)}</span>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  onClick={handleResend}
                  className="text-primary hover:text-primary-light font-medium"
                >
                  Resend Code
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}