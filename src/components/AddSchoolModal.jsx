import { useState, useEffect } from 'react';
import { School, MapPin, Building, Calendar, X } from 'lucide-react';
import api from '../api/axiosConfig';
import TimePicker from './TimePicker';

const AddSchoolModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    startTime: '08:00',
    endTime: '15:00',
    startDate: new Date().toISOString().split('T')[0]
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        address: initialData.address || '',
        startTime: initialData.startTime || '08:00',
        endTime: initialData.endTime || '15:00',
        startDate: initialData.startDate || new Date().toISOString().split('T')[0]
      });
    } else {
        setFormData({
            name: '',
            address: '',
            startTime: '08:00',
            endTime: '15:00',
            startDate: new Date().toISOString().split('T')[0]
        });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address) {
       setError('Please provide both the School Name and Address.');
       return;
    }

    setLoading(true);
    setError('');

    try {
      if (initialData) {
        console.log(`[DEBUG] Attempting PUT to /admin/schools/${initialData.schoolId}`, formData);
        await api.put(`/admin/schools/${initialData.schoolId}`, formData);
      } else {
        console.log('[DEBUG] Attempting POST to /admin/schools', formData);
        await api.post('/admin/schools', formData);
      }
      onSuccess(initialData ? 'School updated successfully' : 'School registered successfully');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while saving the school.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${initialData ? 'bg-amber-100 text-amber-600' : 'bg-purple-100 text-purple-600'}`}>
               <Building size={24} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg">
                {initialData ? 'Edit School Details' : 'Register New School'}
              </h2>
              <p className="text-sm text-slate-500">
                {initialData ? 'Modify the core details and timings of the facility.' : 'Provide the core details and timings of the facility.'}
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">School Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <School size={18} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field pl-10 bg-white"
                    placeholder="e.g. Lincoln High School"
                  />
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">School Start Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar size={18} />
                  </div>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="input-field !pl-10 bg-white"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Location / Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin size={18} />
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field pl-10 bg-white"
                    placeholder="e.g. 123 Main St, Springfield"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time</label>
                <TimePicker
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">End Time</label>
                <TimePicker
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                />
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
                className={`flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white transition-all shadow-lg ${initialData ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' : 'bg-slate-800 hover:bg-slate-900 shadow-slate-900/20'} disabled:opacity-50`}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <Building size={18} />
                    {initialData ? 'Update School' : 'Register School'}
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

export default AddSchoolModal;
