import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Mail, AlertCircle } from 'lucide-react';

export default function Verify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'pending' | 'loading' | 'confirmed' | 'error'>('pending');
  const [message, setMessage] = useState('Checking verification status...');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Get email from URL params if available
  const email = searchParams.get('email') || '';

  useEffect(() => {
    const checkSession = async () => {
      setStatus('loading');
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setStatus('confirmed');
        setMessage('Email confirmed! Redirecting to sign in...');
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      } else {
        setStatus('pending');
        setMessage('Please check your email to confirm your account.');
      }
    };

    checkSession();
  }, [navigate]);

  const handleResend = async () => {
    if (!email) {
      setMessage('Email address required. Please sign up again.');
      setStatus('error');
      return;
    }

    setResending(true);
    try {
      // For resending, we need to use the reset password flow or sign up again
      // Since we don't have the original password, we'll show instructions
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        setMessage('Failed to resend email. Please try again or contact support.');
        setStatus('error');
      } else {
        setResendSuccess(true);
        setMessage('Confirmation email sent! Please check your inbox.');
      }
    } catch (err) {
      setMessage('An error occurred. Please try again.');
      setStatus('error');
    }
    setResending(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 mx-auto text-blue-500 animate-spin" />
              <CardTitle className="mt-4">Verifying Email</CardTitle>
            </>
          )}
          {status === 'confirmed' && (
            <>
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <CardTitle className="mt-4 text-green-600">Email Confirmed!</CardTitle>
            </>
          )}
          {status === 'pending' && (
            <>
              <Mail className="w-16 h-16 mx-auto text-blue-500" />
              <CardTitle className="mt-4 text-blue-600">Check Your Email</CardTitle>
            </>
          )}
          {status === 'error' && (
            <>
              <AlertCircle className="w-16 h-16 mx-auto text-red-500" />
              <CardTitle className="mt-4 text-red-600">Verification Issue</CardTitle>
            </>
          )}
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{message}</p>

          {status === 'pending' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Click the confirmation link in the email we sent to verify your account.
              </p>
              <Button 
                onClick={handleResend} 
                disabled={resending}
                variant="outline"
                className="w-full"
              >
                {resending ? 'Sending...' : resendSuccess ? 'Email Sent!' : 'Resend Confirmation Email'}
              </Button>
              <Button 
                onClick={() => navigate('/auth')} 
                className="w-full"
              >
                Go to Sign In
              </Button>
            </div>
          )}

          {status === 'confirmed' && (
            <p className="text-sm text-green-600">
              Redirecting to sign in...
            </p>
          )}

          {status === 'error' && (
            <Button onClick={() => navigate('/auth')} className="w-full">
              Go to Sign In
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
