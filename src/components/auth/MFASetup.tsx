import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Shield, Mail } from 'lucide-react';
import { sendEmailOTP, generateOTP, enableUserMFA } from '@/lib/mfa';

interface MFASetupProps {
  onComplete: () => void;
}

export default function MFASetup({ onComplete }: MFASetupProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [expectedCode, setExpectedCode] = useState('');
  const [step, setStep] = useState<'choose' | 'verify'>('choose');

  const { user } = useAuth();
  const { toast } = useToast();

  const handleSendCode = async () => {
    if (!user) return;

    setIsVerifying(true);
    const code = generateOTP();
    setExpectedCode(code);

    try {
      const success = await sendEmailOTP(user.email || '', code);

      if (success) {
        setStep('verify');
        toast({
          title: 'Code sent!',
          description: 'Check your email for the verification code.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send verification code. Please try again.',
        variant: 'destructive',
      });
    }

    setIsVerifying(false);
  };

  const handleVerifyCode = async () => {
    if (otpCode !== expectedCode) {
      toast({
        title: 'Invalid code',
        description: 'The code you entered is incorrect. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) return;

    try {
      const success = await enableUserMFA(user.id, 'email');

      if (success) {
        toast({
          title: 'MFA Enabled!',
          description: 'Your account is now protected with two-factor authentication.',
        });
        onComplete();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to enable MFA. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (step === 'verify') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Verify Your Code
          </CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to your email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="otp">Verification Code</Label>
            <input
              id="otp"
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-3 py-2 border rounded-md"
              maxLength={6}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setStep('choose')}
              variant="outline"
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleVerifyCode}
              disabled={otpCode.length !== 6}
              className="flex-1"
            >
              Verify & Enable
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Enable Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account. Choose how you'd like to receive verification codes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-4">
          <Mail className="w-12 h-12 mx-auto mb-4 text-primary" />
          <p className="text-sm text-muted-foreground">
            You will receive verification codes via email.
          </p>
        </div>

        <Button
          onClick={handleSendCode}
          disabled={isVerifying}
          className="w-full"
        >
          {isVerifying ? 'Sending Code...' : 'Send Verification Code'}
        </Button>
      </CardContent>
    </Card>
  );
}