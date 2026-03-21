import { useState, useEffect } from 'react';
import { School, Building, Plus, Pencil, Trash2, Search, MapPin, Calendar, Clock, AlertTriangle } from 'lucide-react';
import api from '../api/axiosConfig';
import AddSchoolModal from '../components/AddSchoolModal';

const ManageSchools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const response = await api.get('/schools');
      setSchools(response.data);
    } catch (err) {
      setError('Failed to fetch schools. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.prefix.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (school) => {
    setEditingSchool(school);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingSchool(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (school) => {
    setSchoolToDelete(school);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!schoolToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/schools/${schoolToDelete.schoolId}`);
      setSuccess(`School '${schoolToDelete.name}' deleted successfully.`);
      fetchSchools();
      setIsDeleteModalOpen(false);
      setSchoolToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete school.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleModalSuccess = (message) => {
    setSuccess(message);
    fetchSchools();
  };

  return (
    <div className="pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Schools</h1>
          <p className="text-slate-500 text-sm mt-1">View, edit, or register educational institutions.</p>
        </div>
        <button
          onClick={handleAddNew}
          className="btn-primary flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 shadow-primary-600/20"
        >
          <Plus size={18} />
          Register New School
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 font-medium text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          {success}
        </div>
      )}

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-3 h-full">
            <div className="relative h-full flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search by school name, address or prefix..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 h-full min-h-[48px] bg-white border-slate-200"
              />
            </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4 bg-white/50">
           <div className="h-10 w-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <Building size={20} />
           </div>
           <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Schools</p>
              <p className="text-xl font-bold text-slate-900">{schools.length}</p>
           </div>
        </div>
      </div>

      {/* Schools Table */}
      <div className="glass-card overflow-hidden bg-white border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">School Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Prefix</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timing</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                       <div className="h-8 w-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                       <p className="text-sm font-medium">Loading schools...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                       <School size={48} className="opacity-20 mb-2" />
                       <p className="text-lg font-bold text-slate-400">No schools found</p>
                       <p className="text-sm">Try adjusting your search or register a new school.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSchools.map((school) => (
                  <tr key={school.schoolId} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm group-hover:text-primary-600 transition-colors uppercase">{school.name}</span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <MapPin size={12} />
                          <span className="truncate max-w-[200px]">{school.address}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
                        {school.prefix}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(school.startDate).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                       <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" />
                          <span>{school.startTime} - {school.endTime}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(school)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Edit School"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(school)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete School"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AddSchoolModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        initialData={editingSchool}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6">
                <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                   <Trash2 size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete School?</h3>
                <p className="text-slate-500 text-sm mb-6">
                   Are you sure you want to delete <span className="font-semibold text-slate-700">{schoolToDelete?.name}</span>? This action cannot be undone and may affect associated records.
                </p>
                <div className="flex items-center justify-end gap-3">
                   <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={deleteLoading}
                    className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                   >
                     Cancel
                   </button>
                   <button
                    onClick={confirmDelete}
                    disabled={deleteLoading}
                    className="px-6 py-2 font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                   >
                     {deleteLoading ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     ) : 'Delete School'}
                   </button>
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ManageSchools;
