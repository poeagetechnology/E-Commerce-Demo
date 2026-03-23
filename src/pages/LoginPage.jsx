// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Store, LogIn } from 'lucide-react';
import { loginUser, loginWithGoogle } from '@/services/authService';
import { DEMO_CREDENTIALS } from '@/constants';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginUser(form);
      navigate('/home');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/home');
    } catch (err) {
      toast.error(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (cred) => setForm({ email: cred.email, password: cred.password });

  return (
    <div className="w-full max-w-md animate-slide-up">
      {/* Card */}
      <div className="card p-8 shadow-xl">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center mb-3">
            <Store size={24} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl">Welcome back</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to your NexCart account</p>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="btn-secondary w-full mb-4 gap-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-gray-800" /></div>
          <div className="relative flex justify-center"><span className="px-3 bg-white dark:bg-gray-900 text-xs text-gray-400">or email</span></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">Email</label>
            <input
              type="email" required
              className="input"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">Password</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'} required
                className="input pr-10"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            <LogIn size={16} /> {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          No account? <Link to="/register" className="text-brand-600 hover:underline font-medium">Register</Link>
        </p>
      </div>

      {/* Demo credentials */}
      <div className="mt-4 card p-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Demo Accounts</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_CREDENTIALS.map(cred => (
            <button
              key={cred.role}
              onClick={() => fillDemo(cred)}
              className="text-left px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-all"
            >
              <p className="text-xs font-semibold text-brand-600">{cred.role}</p>
              <p className="text-xs text-gray-400 truncate">{cred.email}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
