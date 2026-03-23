// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Store, UserPlus } from 'lucide-react';
import { registerUser } from '@/services/authService';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await registerUser(form);
      toast.success('Account created!');
      navigate('/home');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-slide-up">
      <div className="card p-8 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center mb-3">
            <Store size={24} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl">Create account</h1>
          <p className="text-sm text-gray-400 mt-1">Join NexCart today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'displayName', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">{label}</label>
              <input type={type} required className="input" placeholder={placeholder}
                value={form[key]} onChange={update(key)} />
            </div>
          ))}
          {['password', 'confirm'].map(k => (
            <div key={k}>
              <label className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                {k === 'password' ? 'Password' : 'Confirm Password'}
              </label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} required className="input pr-10"
                  placeholder="••••••••" value={form[k]} onChange={update(k)} />
                {k === 'password' && (
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            <UserPlus size={16} /> {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-4">
          Have an account? <Link to="/login" className="text-brand-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
