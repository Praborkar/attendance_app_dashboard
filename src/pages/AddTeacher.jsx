import { useState } from 'react';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import api from '../api/axiosConfig';

const AddTeacher = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill out all fields.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/admin/teachers', formData);
      setSuccess(`Teacher account for ${formData.name} created successfully! They are currently unassigned.`);
      setFormData({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create teacher account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add New Teacher</h1>
        <p className="text-slate-500 text-sm mt-1">Create a new teacher account in the system.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
             <UserPlus size={24} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-lg">Teacher Details</h2>
            <p className="text-sm text-slate-500">Enter the credentials for the new teacher.</p>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 font-medium text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-10 bg-white"
                  placeholder="e.g. Jane Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10 bg-white"
                  placeholder="teacher@school.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Temporary Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 bg-white"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">The teacher will use this password for their initial login.</p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full md:w-auto px-8 flex items-center justify-center gap-2 h-11"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Create Teacher Account
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTeacher;
