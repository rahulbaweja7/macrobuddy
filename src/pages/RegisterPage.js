import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GOOGLE_AUTH_URL } from '../utils/api';
import { FaEye, FaEyeSlash, FaArrowRight, FaCheck } from 'react-icons/fa';

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const PW_CHECKS = [
  { label: 'At least 6 characters', test: v => v.length >= 6 },
  { label: 'Contains a number',     test: v => /\d/.test(v) },
];

export default function RegisterPage({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!name.trim())                       e.name     = 'Name is required';
    if (!email)                             e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email))  e.email    = 'Enter a valid email';
    if (!password)                          e.password = 'Password is required';
    else if (password.length < 6)          e.password = 'At least 6 characters required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setApiError(''); setLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ id, label, type, value, onChange, placeholder, error, children }) => (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="relative">
        <input
          id={id} type={type} value={value} onChange={onChange} placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
            error ? 'border-red-400 dark:border-red-500/60' : 'border-gray-200 dark:border-white/10'
          }`}
        />
        {children}
      </div>
      {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-[#060612] px-12 py-10 border-r border-white/5">
        <div>
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-base">🥗</div>
            <span className="text-lg font-black text-white tracking-tight">MacroBuddy</span>
          </div>
          <h2 className="text-3xl font-black text-white leading-tight mb-3">
            Eat smarter,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">not less.</span>
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-10">
            Set your goals once. MacroBuddy handles the rest — from AI recipes to real fast food.
          </p>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/8">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Free forever includes</p>
            {['Unlimited meal suggestions','Fast food finder (51 chains)','Meal planning calendar','Save unlimited favorites'].map(f => (
              <div key={f} className="flex items-center gap-2.5 py-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <FaCheck size={8} className="text-emerald-400" />
                </div>
                <span className="text-sm text-slate-300">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-600">© {new Date().getFullYear()} MacroBuddy</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-[#080810]">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-sm">🥗</div>
            <span className="text-base font-black text-gray-900 dark:text-white">MacroBuddy</span>
          </div>

          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Create account</h1>
          <p className="text-sm text-gray-400 dark:text-slate-500 mb-7">Free forever. No credit card needed.</p>

          <button
            onClick={() => { window.location.href = GOOGLE_AUTH_URL; }}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/8 transition mb-5"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100 dark:bg-white/8" />
            <span className="text-xs text-gray-400 dark:text-slate-600 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-white/8" />
          </div>

          {apiError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-500/20">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Field id="name" label="Full name" type="text" value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
              placeholder="Your name" error={errors.name} />

            <Field id="email" label="Email" type="email" value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
              placeholder="you@example.com" error={errors.email} />

            <div>
              <Field id="password" label="Password" type={showPw ? 'text' : 'password'} value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                placeholder="Min. 6 characters" error={errors.password}>
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition p-1">
                  {showPw ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </Field>
              {password.length > 0 && (
                <div className="flex gap-3 mt-2">
                  {PW_CHECKS.map(({ label, test }) => (
                    <div key={label} className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${test(password) ? 'text-emerald-500' : 'text-gray-300 dark:text-slate-700'}`}>
                      <FaCheck size={9} /> {label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="group w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-sm font-bold disabled:opacity-60 transition-all shadow-lg shadow-indigo-500/20 mt-1">
              {loading ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <> Create account <FaArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" /> </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-slate-500">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
