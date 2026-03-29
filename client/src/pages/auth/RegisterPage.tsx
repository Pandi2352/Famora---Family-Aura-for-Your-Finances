import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, HeartHandshake, Check, X, Users, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/auth.store';
import AuthBrandPanel from './AuthBrandPanel';

const PASSWORD_RULES = [
  { label: 'At least 6 characters', test: (p: string) => p.length >= 6 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /\d/.test(p) },
  { label: 'One special character', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const strength = useMemo(() => PASSWORD_RULES.filter((r) => r.test(password)).length, [password]);
  const strengthLabel = strength === 0 ? '' : strength <= 1 ? 'Weak' : strength <= 2 ? 'Fair' : strength <= 3 ? 'Good' : 'Strong';
  const strengthColor = strength <= 1 ? 'bg-danger-500' : strength <= 2 ? 'bg-accent-500' : strength <= 3 ? 'bg-primary-500' : 'bg-success-500';
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !familyName || !email || !password) return toast.error('Please fill all fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await register(name, email, password, familyName);
      toast.success('Family created! Welcome to Famora');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <AuthBrandPanel />

      <div className="flex-1 flex items-center justify-center bg-card px-6 py-12 relative">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />

        <div className="relative z-10 w-full max-w-md">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-violet-600 rounded-xl flex items-center justify-center">
              <HeartHandshake className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-heading">Famora</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-heading">Create your family</h2>
            <p className="text-sm text-subtle mt-1.5">Start managing your family's finances together</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-heading mb-1.5">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input type="text" placeholder="Rahul" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-heading mb-1.5">Family Name</label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input type="text" placeholder="Sharma Family" value={familyName} onChange={(e) => setFamilyName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-heading mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-heading mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-surface border border-border rounded-xl text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-subtle transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-3 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < strength ? strengthColor : 'bg-border'}`} />
                      ))}
                    </div>
                    <span className={`text-[11px] font-semibold ${strength <= 1 ? 'text-danger-500' : strength <= 2 ? 'text-accent-600' : strength <= 3 ? 'text-primary-600' : 'text-success-600'}`}>{strengthLabel}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PASSWORD_RULES.map((rule) => {
                      const passed = rule.test(password);
                      return (
                        <div key={rule.label} className="flex items-center gap-1.5">
                          {passed ? <Check className="w-3 h-3 text-success-600 shrink-0" /> : <X className="w-3 h-3 text-muted shrink-0" />}
                          <span className={`text-[11px] ${passed ? 'text-success-600' : 'text-muted'}`}>{rule.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-heading mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input type={showPassword ? 'text' : 'password'} placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-11 pr-12 py-3 bg-surface border rounded-xl text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 transition-colors ${
                    passwordsMismatch ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500' : passwordsMatch ? 'border-success-500 focus:ring-success-500/20 focus:border-success-500' : 'border-border focus:ring-primary-500/20 focus:border-primary-500'
                  }`} />
                {passwordsMatch && <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-success-600" />}
                {passwordsMismatch && <X className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-danger-500" />}
              </div>
              {passwordsMismatch && <p className="text-xs text-danger-500 mt-1.5">Passwords don't match</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-700 hover:to-violet-700 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-primary-600/20 disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>Create Family <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-subtle mt-8">
            Already have a family?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
