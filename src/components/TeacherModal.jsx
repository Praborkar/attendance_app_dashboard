import { useState, useEffect } from 'react';
import { User, Phone, Mail, School, X, CheckCircle2 } from 'lucide-react';
import api from '../api/axiosConfig';
import Dropdown from './Dropdown';

const TeacherModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobileNo: '',
    email: '',
    schoolId: '',
    approved: false
  });
  
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const res = await api.get('/schools');
      setSchools(res.data || []);
    } catch (err) {
      console.error('Failed to fetch schools');
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        mobileNo: initialData.mobileNo || '',
        email: initialData.email || '',
        schoolId: initialData.schoolId || '', // Initial data might not have schoolId if it's just the response
        approved: initialData.approved || false
      });
      
      // If we have a schoolName but not schoolId, we might need to find it or handle it
      // For now, assume the backend provides schoolId or we'll handle it during fetch
    } else {
      setFormData({
        name: '',
        mobileNo: '',
        email: '',
        schoolId: '',
        approved: false
      });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSchoolChange = (schoolId) => {
    setFormData({ ...formData, schoolId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.mobileNo) {
      setError('Name and Mobile Number are required.');
      return;
    }

    if (formData.mobileNo.length !== 10) {
      setError('Mobile Number must be exactly 10 digits.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        email: formData.email || null,
        mobileNo: formData.mobileNo,
        approved: formData.approved,
        schoolId: formData.schoolId || null
      };

      if (initialData) {
        await api.put(`/admin/teachers/${initialData.id}`, payload);
      } else {
        await api.post('/admin/teachers', payload);
      }
      onSuccess(initialData ? 'Teacher updated successfully' : 'Teacher registered successfully');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while saving teacher details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${initialData ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
               <User size={24} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg">
                {initialData ? 'Edit Teacher Details' : 'Register New Teacher'}
              </h2>
              <p className="text-sm text-slate-500">
                {initialData ? 'Update account information and school assignment.' : 'Create a new teacher account and assign to a school.'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {error && (
             <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium text-sm">
                {error}
             </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
              <div className="md:col-span-1">
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
                    placeholder="e.g. John Doe"
                  />
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone size={18} />
                  </div>
                  <input
                    type="text"
                    name="mobileNo"
                    value={formData.mobileNo}
                    onChange={handleChange}
                    className="input-field pl-10 bg-white"
                    placeholder="10-digit number"
                  />
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address (Optional)</label>
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
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Assign School</label>
                <Dropdown
                  options={schools.map(s => ({ id: s.schoolId, label: s.name }))}
                  selected={formData.schoolId}
                  onChange={handleSchoolChange}
                  placeholder="Select a school"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    name="approved"
                    checked={formData.approved}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className="block text-sm font-bold text-slate-800 leading-tight">Approved for Login</span>
                    <span className="text-xs text-slate-500">Allow this teacher to access the mobile application.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white transition-all shadow-lg ${initialData ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20' : 'bg-slate-800 hover:bg-slate-900 shadow-slate-900/20'} disabled:opacity-50`}
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    {initialData ? <CheckCircle2 size={18} /> : <User size={18} />}
                    {initialData ? 'Update Teacher' : 'Register Teacher'}
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

export default TeacherModal;
