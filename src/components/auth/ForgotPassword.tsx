import { useState } from 'react';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AuthError } from '@supabase/supabase-js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Set flag to prevent dashboard redirect when going back to this tab
      localStorage.setItem('resettingPassword', 'true');

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage('Check your email for the password reset link');
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Forgot your password?
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={`
                  w-full pl-10 pr-4 py-3 rounded-lg border
                  bg-white dark:bg-gray-800
                  border-gray-300 dark:border-gray-600
                  text-gray-900 dark:text-white
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition-col
                  ${error ? 'border-red-500 ring-red-200 dark:ring-red-900/30' : ''}
                `}
              />
            </div>

            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            {message && (
              <p className="mt-3 text-sm text-green-600 dark:text-green-400 font-medium">
                {message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`
              w-full flex items-center justify-center gap-2 py-3 px-4
              bg-[#00CEC8] hover:bg-[#00CEC8]/90
              text-white font-medium rounded-lg
              focus:outline-none focus:ring-2 focus:ring-[#00CEC8] focus:ring-offset-2
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-all duration-200
              dark:bg-[#00CEC8] dark:hover:bg-[#00CEC8]/90
            `}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        {/* Back to login */}
        <div className="mt-8 text-center text-sm">
          <Link
            to="/auth"
            className="text-[#00CEC8] hover:text-[#00CEC8]/80 dark:text-[#00CEC8] dark:hover:text-[#00CEC8]/80 font-medium transition-colors flex items-center justify-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
