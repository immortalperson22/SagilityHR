import { useState, useEffect } from 'react';
import { Key, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Clear resetting flag when component mounts
  useEffect(() => {
    localStorage.removeItem('resettingPassword');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      let msg = "Password must contain:";
      if (!hasUpper) msg += " an uppercase letter,";
      if (!hasLower) msg += " a lowercase letter,";
      if (!hasNumber) msg += " a number,";
      if (!hasSpecial) msg += " a special character (e.g. @ # $ % & *)";
      setError(msg.trim().replace(/,$/, ''));
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(updateError.message || "Failed to update password");
    } else {
      // Clear the resetting flag so dashboard redirect works normally
      localStorage.removeItem('resettingPassword');
      setSuccess(true);
      setTimeout(() => {
        window.location.href = window.location.origin + '/auth';
      }, 1500);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
            Password Updated!
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Redirecting you to the login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Reset Password
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Enter your new password
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-12 py-3 rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : ''}`}
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`w-full px-4 py-3 pr-12 rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : ''}`}
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#00CEC8] hover:bg-[#00CEC8]/90 text-white font-medium rounded-lg disabled:opacity-60 transition-colors dark:bg-[#00CEC8] dark:hover:bg-[#00CEC8]/90"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password must include:
          </p>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li className={password.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}>
              ✓ At least 8 characters
            </li>
            <li className={/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}>
              ✓ Uppercase letter
            </li>
            <li className={/[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}>
              ✓ Lowercase letter
            </li>
            <li className={/[0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}>
              ✓ Number
            </li>
            <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}>
              ✓ Special character (@, #, $, etc.)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
