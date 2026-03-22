import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Shield, Mail } from 'lucide-react';
import { sendEmailOTP, generateOTP } from '@/lib/mfa';

interface MFAPromptProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function MFAPrompt({ onSuccess, onCancel }: MFAPromptProps) {
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [expectedCode, setExpectedCode] = useState('');

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
        toast({
          title: 'Code sent!',
          description: 'Check your email for the verification code.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send verification code.',
        variant: 'destructive',
      });
    }

    setIsVerifying(false);
  };

  const handleVerifyCode = () => {
    if (otpCode !== expectedCode) {
      toast({
        title: 'Invalid code',
        description: 'The code you entered is incorrect.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Verification successful!',
      description: 'Welcome back to your account.',
    });
    onSuccess();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Enter the verification code sent to your registered method.
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
            className="w-full px-3 py-2 border rounded-md mt-1"
            maxLength={6}
          />
        </div>

        <div className="space-y-2">
          <Label>Didn't receive the code?</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSendCode}
              disabled={isVerifying}
              className="flex items-center gap-1"
            >
              <Mail className="w-3 h-3" />
              Resend Email
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleVerifyCode}
            disabled={otpCode.length !== 6}
            className="flex-1"
          >
            Verify & Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}