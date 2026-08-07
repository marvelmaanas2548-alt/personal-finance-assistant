import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, User, KeyRound, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('alex.morgan@finance.io');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Alex Morgan');
  const [mfaCode, setMfaCode] = useState('');
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [forgotPasswordMsg, setForgotPasswordMsg] = useState('');
  const [emailVerifiedNotice, setEmailVerifiedNotice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoginView) {
      setEmailVerifiedNotice('Account created! A verification email link has been sent to your inbox.');
      setTimeout(() => {
        login('jwt_token_demo_999', { id: `u_${Date.now()}`, name: name || 'New User', email, age: 28, occupation: 'Financial Analyst', salary: 120000, financialGoals: ['Emergency Fund', 'Savings'], riskAppetite: 'Moderate', preferredCurrency: '₹', country: 'India', taxInfo: 'PAN: XXX1234', isMfaEnabled: false, avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80' });
      }, 1200);
      return;
    }
    if (email === 'mfa@finance.io' && !showMfaInput) { setShowMfaInput(true); return; }
    login('jwt_token_demo_101', { id: 'u_101', name: name || 'Alex Morgan', email, age: 29, occupation: 'Senior Software Engineer', salary: 145000, financialGoals: ['Buy House', 'Emergency Fund', 'Retirement'], riskAppetite: 'Moderate', preferredCurrency: '₹', country: 'India', taxInfo: 'PAN: ABCDE1234F', isMfaEnabled: false, avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80' });
  };

  const handleGoogleOAuth = () => {
    login('google_jwt_token_auth', { id: 'u_google', name: 'Alex Morgan (Google)', email: 'alex.morgan.google@gmail.com', age: 29, occupation: 'Senior Engineer', salary: 145000, financialGoals: ['Buy House', 'Emergency Fund'], riskAppetite: 'Moderate', preferredCurrency: '₹', country: 'India', isMfaEnabled: false, avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80' });
  };

  const handleForgotPassword = () => { setForgotPasswordMsg(`Password reset instructions have been dispatched to ${email || 'your email'}.`); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Personalized Finance AI</h1>
          <p className="text-xs text-slate-500 mt-1">Your Intelligent Personal Finance Assistant</p>
        </div>

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
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Alex Morgan" value={name} onChange={e => setName(e.target.value)} className="w-full glass-input pl-9 pr-4 py-2.5 rounded-xl text-sm" required />
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" placeholder="alex.morgan@finance.io" value={email} onChange={e => setEmail(e.target.value)} className="w-full glass-input pl-9 pr-4 py-2.5 rounded-xl text-sm" required />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-600">Password</label>
              {isLoginView && (<button type="button" onClick={handleForgotPassword} className="text-[11px] text-indigo-600 hover:underline">Forgot Password?</button>)}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="password" placeholder="••••••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full glass-input pl-9 pr-4 py-2.5 rounded-xl text-sm" required />
            </div>
          </div>
          {showMfaInput && (
            <div>
              <label className="block text-xs font-semibold text-amber-600 mb-1">2FA / Multi-Factor Code</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                <input type="text" placeholder="Enter 6-digit MFA Code (e.g. 123456)" value={mfaCode} onChange={e => setMfaCode(e.target.value)} className="w-full glass-input pl-9 pr-4 py-2.5 rounded-xl text-sm border-amber-300" required />
              </div>
            </div>
          )}
          <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
            <span>{isLoginView ? (showMfaInput ? 'Verify MFA & Sign In' : 'Sign In with JWT') : 'Create Account'}</span><ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px bg-slate-200 flex-1" /><span className="text-[11px] text-slate-400 font-medium">OR CONTINUE WITH</span><div className="h-px bg-slate-200 flex-1" />
        </div>

        <button onClick={handleGoogleOAuth} className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-3 transition">
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.33 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>
          <span>Sign In with Google</span>
        </button>

        <div className="mt-6 text-center text-xs text-slate-500">
          {isLoginView ? "Don't have an account?" : 'Already registered?'}
          <button onClick={() => setIsLoginView(!isLoginView)} className="ml-1.5 text-indigo-600 font-bold hover:underline">{isLoginView ? 'Register Now' : 'Sign In'}</button>
        </div>
      </div>
    </div>
  );
};
