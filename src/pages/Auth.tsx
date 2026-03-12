import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [isActive, setIsActive] = useState(false);

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [passwordError, setPasswordError] = useState('');

  const formRef = useRef<HTMLDivElement>(null);

  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const isResetting = localStorage.getItem('resettingPassword');
    if (user && !isResetting) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const validatePassword = (password: string): string => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[@$!%*?&]/.test(password)) {
      return 'Password must contain at least one special character (@$!%*?&)';
    }
    return '';
  };

  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength;
  };

  const resetSignUp = () => {
    setSignUpEmail('');
    setSignUpPassword('');
    setSignUpName('');
    setShowSignUpPassword(false);
    setPasswordError('');
  };

  const resetSignIn = () => {
    setSignInEmail('');
    setSignInPassword('');
    setShowSignInPassword(false);
  };

  const handleSwitchToSignIn = () => {
    resetSignUp();
    setIsActive(false);
  };

  const handleSwitchToSignUp = () => {
    resetSignIn();
    setIsActive(true);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await signIn(signInEmail, signInPassword);
    if (result.error) {
      toast({
        title: 'Sign in failed',
        description: result.error.message,
        variant: 'destructive',
      });
    } else {
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your full name.',
        variant: 'destructive',
      });
      return;
    }

    const error = validatePassword(signUpPassword);
    if (error) {
      setPasswordError(error);
      toast({
        title: 'Password requirements',
        description: error,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const result = await signUp(signUpEmail, signUpPassword, signUpName);
    if (result.error) {
      toast({
        title: 'Sign up failed',
        description: result.error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Account created!',
        description: 'Please check your email to confirm your account.',
      });
      navigate(`/verify?email=${encodeURIComponent(signUpEmail)}`);
      resetSignUp();
    }
    setIsLoading(false);
  };

  return (
    <div className="auth-page-body">
      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 z-[9999] w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700" />
        )}
      </button>

      <div className={`auth-container ${isActive ? 'active' : ''}`} id="container">
        {/* Sign Up Form */}
        <div className="form-container sign-up" ref={formRef}>
          <form onSubmit={handleSignUp}>
            <h1>Create Account</h1>
            <span>use your email for registration</span>
            <input
              type="text"
              placeholder="Name"
              value={signUpName}
              onChange={(e) => setSignUpName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              required
            />
            <div className="password-input-container">
              <input
                type={showSignUpPassword ? "text" : "password"}
                placeholder="Password"
                value={signUpPassword}
                onChange={(e) => {
                  setSignUpPassword(e.target.value);
                  setPasswordError('');
                }}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowSignUpPassword(!showSignUpPassword)}
              >
                {showSignUpPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {signUpPassword && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className={`strength-fill strength-${getPasswordStrength(signUpPassword)}`}
                    style={{ width: `${(getPasswordStrength(signUpPassword) / 5) * 100}%` }}
                  />
                </div>
                <span className="strength-text">
                  {getPasswordStrength(signUpPassword) < 3 ? 'Weak' : getPasswordStrength(signUpPassword) < 5 ? 'Medium' : 'Strong'}
                </span>
              </div>
            )}
            {passwordError && <p className="password-error">{passwordError}</p>}
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="form-container sign-in">
          <form onSubmit={handleSignIn}>
            <h1>Sign In</h1>
            <span>use your email password</span>
            <input
              type="email"
              placeholder="Email"
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
              required
            />
            <div className="password-input-container">
              <input
                type={showSignInPassword ? "text" : "password"}
                placeholder="Password"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowSignInPassword(!showSignInPassword)}
              >
                {showSignInPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            <a href="/forgot-password" className="forgot-password-link">Forgot your password?</a>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Toggle Container */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all of site features</p>
              <button
                type="button"
                className="hidden-btn"
                onClick={handleSwitchToSignIn}
              >
                Sign In
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Hello, Friend!</h1>
              <p>Register with your personal details to use all of site features</p>
              <button
                type="button"
                className="hidden-btn"
                onClick={handleSwitchToSignUp}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile toggle buttons */}
      <div className="md:hidden mt-4 text-center space-y-2">
        {isActive ? (
          <button
            onClick={handleSwitchToSignIn}
            className="text-sm text-primary underline block w-full"
          >
            Already have an account? Sign In
          </button>
        ) : (
          <button
            onClick={handleSwitchToSignUp}
            className="text-sm text-primary underline block w-full"
          >
            Don't have an account? Sign Up
          </button>
        )}
      </div>
    </div>
  );
}
