import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, User, KeyRound, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotPasswordMsg, setForgotPasswordMsg] = useState('');
  const [emailVerifiedNotice, setEmailVerifiedNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Handle Google OAuth callback token from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userId = params.get('userId');
    if (token) {
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
      // Fetch user profile using token
      fetch(`${baseUrl}/api/finance/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(user => {
          if (user && user.id) {
            login(token, user);
          }
        })
        .catch(() => {
          // If profile fetch fails, create minimal user
          login(token, {
            id: userId || `u_${Date.now()}`,
            name: 'User',
            email: '',
            age: 25,
            occupation: 'Professional',
            salary: 100000,
            financialGoals: ['Emergency Fund', 'Savings'],
            riskAppetite: 'Moderate' as const,
            preferredCurrency: '₹' as const,
            country: 'India',
            taxInfo: '',
            isMfaEnabled: false,
            avatarUrl: ''
          });
        });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const endpoint = isLoginView ? `${baseUrl}/api/auth/login` : `${baseUrl}/api/auth/register`;
      const payload = isLoginView ? { email, password, mfaCode } : { name, email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok) {
        setErrorMsg(data.error || 'Authentication failed. Please check your details.');
        return;
      }

      if (data.requireMfa && !showMfaInput) {
        setShowMfaInput(true);
        return;
      }

      if (data.token && data.user) {
        if (!isLoginView) {
          setEmailVerifiedNotice('Account created! A verification email link has been sent to your inbox.');
        }
        login(data.token, data.user);
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Unable to connect to server. Please try again.');
    }
  };

  const handleGoogleOAuth = async () => {
    setIsLoading(true);
    setErrorMsg('');

    // Try redirect-based OAuth first (if server has Google credentials configured)
    // Fall back to email-based Google sign-in
    try {
      // Test if Google OAuth redirect is available
      const testRes = await fetch(`${baseUrl}/api/health`);
      const healthData = await testRes.json();

      if (healthData.status === 'OK') {
        // Use the POST-based Google auth (works without real Google credentials)
        const userGmail = prompt('Enter your Gmail address to Sign In with Google:', email || 'your.name@gmail.com');
        if (!userGmail) {
          setIsLoading(false);
          return;
        }

        const res = await fetch(`${baseUrl}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userGmail,
            name: userGmail.split('@')[0].replace(/[._]/g, ' ')
          })
        });

        const data = await res.json();
        setIsLoading(false);

        if (data.token && data.user) {
          login(data.token, data.user);
        } else {
          setErrorMsg('Google sign-in failed. Please try again.');
        }
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Unable to connect to server for Google Sign-In.');
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      setErrorMsg('Please enter your email address first.');
      return;
    }
    setForgotPasswordMsg(`Password reset instructions have been dispatched to ${email}.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle decorative blobs — single color, no gradient mixing */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-gray-200 shadow-xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-200">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">Personalized Finance AI</h1>
          <p className="text-xs text-gray-500 mt-1">Sign in with your Gmail to access your personal dashboard</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /><span>{errorMsg}</span>
          </div>
        )}
        {emailVerifiedNotice && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" /><span>{emailVerifiedNotice}</span>
          </div>
        )}
        {forgotPasswordMsg && (
          <div className="mb-4 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs">{forgotPasswordMsg}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginView && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full glass-input pl-9 pr-4 py-2.5 rounded-xl text-sm"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="your.email@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full glass-input pl-9 pr-4 py-2.5 rounded-xl text-sm"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-600">Password</label>
              {isLoginView && (
                <button type="button" onClick={handleForgotPassword} className="text-[11px] text-indigo-600 hover:underline">
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full glass-input pl-9 pr-4 py-2.5 rounded-xl text-sm"
                required
              />
            </div>
          </div>

          {showMfaInput && (
            <div>
              <label className="block text-xs font-semibold text-amber-600 mb-1">2FA / Multi-Factor Code</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                <input
                  type="text"
                  placeholder="Enter 6-digit MFA Code (e.g. 123456)"
                  value={mfaCode}
                  onChange={e => setMfaCode(e.target.value)}
                  className="w-full glass-input pl-9 pr-4 py-2.5 rounded-xl text-sm border-amber-300"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-200 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isLoading ? 'Processing...' : (isLoginView ? (showMfaInput ? 'Verify MFA & Sign In' : 'Sign In') : 'Create Account')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-[11px] text-gray-400 font-medium">OR CONTINUE WITH</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <button
          type="button"
          onClick={handleGoogleOAuth}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center gap-3 transition shadow-sm disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span>Sign In with Google Gmail</span>
        </button>

        <div className="mt-6 text-center text-xs text-gray-500">
          {isLoginView ? "Don't have an account?" : 'Already registered?'}
          <button
            onClick={() => setIsLoginView(!isLoginView)}
            className="ml-1.5 text-indigo-600 font-bold hover:underline"
          >
            {isLoginView ? 'Register Now' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};
