import { useState, useEffect } from 'react';
import { UserPlus, Mail, Phone, School, User } from 'lucide-react';
import Dropdown from '../components/Dropdown';
import api from '../api/axiosConfig';

const AddTeacher = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNo: '',
    schoolId: ''
  });
  
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSchools();
  }, []);

  // Auto-dismiss alerts
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchSchools = async () => {
    try {
      setLoadingSchools(true);
      const res = await api.get('/schools');
      setSchools(res.data || []);
      if (res.data && res.data.length > 0) {
        setFormData(prev => ({ ...prev, schoolId: res.data[0].schoolId }));
      }
    } catch (err) {
      setError('Failed to fetch schools list.');
    } finally {
      setLoadingSchools(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSchoolChange = (schoolId) => {
    setFormData({
      ...formData,
      schoolId: schoolId
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.mobileNo || !formData.schoolId) {
      setError('Name, Mobile Number, and School are required.');
      return;
    }

    if (formData.mobileNo.length !== 10) {
      setError('Mobile Number must be exactly 10 digits.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // The backend expects email to be optional (null if empty),
      // and name, mobileNo, schoolId to be present.
      const payload = {
        name: formData.name,
        email: formData.email ? formData.email : null,
        mobileNo: formData.mobileNo,
        schoolId: formData.schoolId
      };

      await api.post('/admin/teachers', payload);
      setSuccess(`Teacher account for ${formData.name} created and assigned successfully!`);
      setFormData({ name: '', email: '', mobileNo: '', schoolId: schools.length > 0 ? schools[0].schoolId : '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create teacher account. Check your input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-12 px-4 md:p-8 max-w-[1600px] mx-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add New Teacher</h1>
          <p className="text-slate-500 text-sm mt-1">Create a new teacher account and assign to a school.</p>
        </div>

        <div className="glass-card">
          <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
               <UserPlus size={24} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Teacher Details</h2>
              <p className="text-xs text-slate-500">Enter personal and contact information.</p>
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

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">School Assignment <span className="text-red-500">*</span></label>
                {loadingSchools ? (
                   <div className="h-11 bg-slate-100 rounded-xl animate-pulse"></div>
                ) : (
                  <Dropdown
                    icon={School}
                    options={schools.map(s => ({ id: s.schoolId, label: `${s.name} (${s.address})` }))}
                    selected={formData.schoolId}
                    onChange={handleSchoolChange}
                    placeholder="-- Choose a School --"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name <span className="text-red-500">*</span></label>
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    name="mobileNo"
                    value={formData.mobileNo}
                    onChange={handleChange}
                    className="input-field pl-10 bg-white"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
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
                    placeholder="teacher@school.edu"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading || !formData.schoolId}
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
  </div>
  );
};

export default AddTeacher;
