import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Currency, RiskAppetite } from '../types';
import { User, Shield, Briefcase, Check, Sun, Moon, Palette, Users } from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [age, setAge] = useState(user?.age?.toString() || '29');
  const [occupation, setOccupation] = useState(user?.occupation || 'Working Professional');
  const [salary, setSalary] = useState(user?.salary?.toString() || '145000');
  const [riskAppetite, setRiskAppetite] = useState<RiskAppetite>(user?.riskAppetite || 'Moderate');
  const [preferredCurrency, setPreferredCurrency] = useState<Currency>(user?.preferredCurrency || '₹');
  const [country, setCountry] = useState(user?.country || 'India');
  const [taxInfo, setTaxInfo] = useState(user?.taxInfo || '');
  const [isMfaEnabled, setIsMfaEnabled] = useState(user?.isMfaEnabled || false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const customerSegments = [
    'Working Professional',
    'Student',
    'Freelancer',
    'Family Household',
    'Small Business Owner'
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      email,
      age: Number(age),
      occupation,
      salary: Number(salary),
      riskAppetite,
      preferredCurrency,
      country,
      taxInfo,
      isMfaEnabled
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">User Financial Profile & Settings</h2>
          <p className="text-xs text-slate-500 mt-1">Configure your personal metrics, customer segment profile, risk parameters, and theme</p>
        </div>
        {savedSuccess && (
          <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4" /> Profile updated successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Theme Indicator */}
        <div className="glass-panel p-6 rounded-3xl border border-gray-200">
          <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4" /> Appearance
          </h3>
          <div className="mt-3 flex items-center gap-3 p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold">Light Mode</div>
              <div className="text-[11px] text-gray-500">Clean, minimal white design</div>
            </div>
          </div>
        </div>

        {/* Basic Personal Information */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4" /> Personal & Demographic Info
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Country / Region</label>
              <input
                type="text"
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Canvas Customer Segment & Financial Metrics */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4" /> Canvas Customer Segment & Financial Metrics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Customer Segment Profile</label>
              <select
                value={occupation}
                onChange={e => setOccupation(e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              >
                {customerSegments.map(segment => (
                  <option key={segment} value={segment} className="bg-white text-slate-900">
                    {segment}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Monthly Base Income</label>
              <input
                type="number"
                value={salary}
                onChange={e => setSalary(e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Risk Appetite</label>
              <select
                value={riskAppetite}
                onChange={e => setRiskAppetite(e.target.value as RiskAppetite)}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              >
                <option value="Low" className="bg-white text-slate-900">Low Risk (Capital Preservation)</option>
                <option value="Moderate" className="bg-white text-slate-900">Moderate Risk (Balanced Portfolio)</option>
                <option value="High" className="bg-white text-slate-900">High Risk (Maximum Growth)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Preferred Currency</label>
              <select
                value={preferredCurrency}
                onChange={e => setPreferredCurrency(e.target.value as Currency)}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
              >
                <option value="₹" className="bg-white text-slate-900">₹ (INR - Rupee)</option>
                <option value="$" className="bg-white text-slate-900">$ (USD - Dollar)</option>
                <option value="€" className="bg-white text-slate-900">€ (EUR - Euro)</option>
                <option value="£" className="bg-white text-slate-900">£ (GBP - Pound)</option>
                <option value="¥" className="bg-white text-slate-900">¥ (JPY - Yen)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Tax ID / PAN / SSN (Optional)</label>
            <input
              type="text"
              placeholder="e.g. PAN: ABCDE1234F"
              value={taxInfo}
              onChange={e => setTaxInfo(e.target.value)}
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Security & Multi-Factor Auth */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Multi-Factor Authentication (2FA)</h4>
              <p className="text-xs text-slate-500">Require an authenticator code during sign in</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isMfaEnabled}
              onChange={e => setIsMfaEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" /> Save Profile Preferences
        </button>
      </form>
    </div>
  );
};
