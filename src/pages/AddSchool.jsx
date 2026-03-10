import { useState } from 'react';
import { School, MapPin, Building } from 'lucide-react';
import api from '../api/axiosConfig';

const AddSchool = () => {
  const [formData, setFormData] = useState({
    schoolName: '',
    location: ''
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
    
    if (!formData.schoolName || !formData.location) {
       setError('Please provide both the School Name and Location.');
       return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/schools', formData);
      setSuccess(`The school '${formData.schoolName}' was successfully registered in the system.`);
      setFormData({ schoolName: '', location: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while adding the school.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add New School</h1>
        <p className="text-slate-500 text-sm mt-1">Register a new educational institution in the database.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
             <Building size={24} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-lg">School Information</h2>
            <p className="text-sm text-slate-500">Provide the core details of the facility.</p>
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">School Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <School size={18} />
                </div>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  className="input-field pl-10 bg-white"
                  placeholder="e.g. Lincoln High School"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Location / Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin size={18} />
                </div>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input-field pl-10 bg-white"
                  placeholder="e.g. 123 Main St, Springfield"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full md:w-auto px-8 flex items-center justify-center gap-2 h-11 bg-slate-800 hover:bg-slate-900 border-none shadow-slate-900/20"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <Building size={18} />
                    Register School
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

export default AddSchool;
