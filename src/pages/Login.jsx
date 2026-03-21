import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Mail, Lock, AlertTriangle, X } from 'lucide-react';
import logo from '../assets/mahavir_dashboard_logo.png';
import api from '../api/axiosConfig';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  
  const navigate = useNavigate();

  // Auto-dismiss alerts
  useEffect(() => {
    if (error || forgotMessage || forgotError) {
      const timer = setTimeout(() => {
        setError('');
        setForgotMessage('');
        setForgotError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, forgotMessage, forgotError]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        username: email,
        password: password,
      });

      const { token, user } = response.data;
      
      // Simple parse to check role if it's not directly in user object 
      // (as seen in Android app JWT decode logic)
      let role = user?.role;
      if (!role) {
        try {
          // Decode just the payload of JWT (Base64)
          const payload = JSON.parse(atob(token.split('.')[1]));
          role = payload.role;
        } catch (e) {
          console.warn("Could not decode role from JWT", e);
        }
      }

      if (role && role.toUpperCase() !== 'ADMIN') {
        setError('Unauthorized: Admin access required.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user || {}));
      
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Invalid email or password');
      } else {
        setError(err.message || 'Unable to connect to server');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError('Please enter your email address');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    setForgotMessage('');

    try {
      const response = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMessage(response.data?.message || 'Password reset instructions have been sent to your email.');
      setForgotEmail('');
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to send reset link. Please verify your email.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-40 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full z-10 p-4">
        <div className="glass-card p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <img src={logo} alt="Attendance App Logo" className="h-[90px] w-auto object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Admin Portal</h2>
            <p className="text-slate-500 text-sm">Sign in to manage the attendance system</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 text-sm rounded-lg bg-red-50 text-red-600 border border-red-100 animate-pulse text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="admin@school.edu"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setShowForgotModal(true);
                    setForgotError('');
                    setForgotMessage('');
                  }}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn-primary w-full mt-4 flex items-center justify-center h-11"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                 <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <ShieldCheck size={24} />
                 </div>
                 <button 
                   onClick={() => setShowForgotModal(false)}
                   className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
                 >
                    <X size={20} />
                 </button>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Reset Password</h3>
              <p className="text-slate-500 text-sm mb-6">
                 Enter the email address associated with your admin account and we will send you a link to reset your password.
              </p>

              {forgotError && (
                <div className="mb-4 p-3 text-sm rounded-lg bg-red-50 text-red-600 border border-red-100 font-medium">
                  {forgotError}
                </div>
              )}
              {forgotMessage && (
                <div className="mb-4 p-3 text-sm rounded-lg bg-green-50 text-green-700 border border-green-200 font-medium">
                  {forgotMessage}
                </div>
              )}

              <form onSubmit={handleForgotPassword}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="admin@school.edu"
                      disabled={forgotLoading || forgotMessage}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                   <button 
                     type="button"
                     onClick={() => setShowForgotModal(false)}
                     disabled={forgotLoading}
                     className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit"
                     disabled={forgotLoading || !forgotEmail || forgotMessage}
                     className="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 shadow-sm shadow-primary-600/20 rounded-xl transition-all flex items-center disabled:opacity-50"
                   >
                     {forgotLoading ? (
                       <div className="flex items-center gap-2">
                         <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                         Sending...
                       </div>
                     ) : (
                        "Send Reset Link"
                     )}
                   </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
