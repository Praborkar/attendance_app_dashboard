import { useState, useEffect } from 'react';
import { User, Users, Plus, Pencil, Trash2, Search, Mail, Phone, Calendar, School, AlertTriangle, CheckCircle2, X, Fingerprint, ArrowRightLeft, Clock } from 'lucide-react';
import api from '../api/axiosConfig';
import TeacherModal from '../components/TeacherModal';
import Dropdown from '../components/Dropdown';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Transfer states
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [teacherToTransfer, setTeacherToTransfer] = useState(null);
  const [transferSchoolId, setTransferSchoolId] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [schools, setSchools] = useState([]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/teachers');
      setTeachers(response.data || []);
    } catch (err) {
      setError('Failed to fetch teachers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const res = await api.get('/schools');
      setSchools(res.data || []);
    } catch (err) {
      console.error('Failed to fetch schools:', err);
    }
  };

  useEffect(() => {
    fetchTeachers();
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

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.mobileNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.schoolName && t.schoolName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingTeacher(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (teacher) => {
    setTeacherToDelete(teacher);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!teacherToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/teachers/${teacherToDelete.id}`);
      setSuccess(`Teacher account for '${teacherToDelete.name}' deleted successfully.`);
      fetchTeachers();
      setIsDeleteModalOpen(false);
      setTeacherToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete teacher account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleTransferClick = (teacher) => {
    setTeacherToTransfer(teacher);
    setTransferSchoolId('');
    setIsTransferModalOpen(true);
  };

  const confirmTransfer = async () => {
    if (!transferSchoolId || !teacherToTransfer) return;
    setTransferLoading(true);
    try {
      await api.put(`/admin/teachers/${teacherToTransfer.id}/transfer`, {
        newSchoolId: transferSchoolId
      });
      setSuccess(`Teacher '${teacherToTransfer.name}' transferred successfully.`);
      fetchTeachers();
      setIsTransferModalOpen(false);
      setTeacherToTransfer(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to transfer teacher.');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleModalSuccess = (message) => {
    setSuccess(message);
    fetchTeachers();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="pb-12 px-4 md:px-8 max-w-[1600px] mx-auto">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-50 bg-slate-50 border-b border-slate-200/50 mb-8 transition-all duration-200">
        <div className="py-8 pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Teachers</h1>
              <p className="text-slate-500 text-sm mt-1">View, edit, or register teacher accounts globally.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:flex-1 lg:justify-end max-w-2xl w-full">
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, mobile, or school..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-medium transition-all bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-3 my-auto text-slate-400 hover:text-slate-600 transition-colors"
                    title="Clear search"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              <button
                onClick={handleAddNew}
                className="btn-primary flex-none flex items-center justify-center gap-2 px-6 py-2.5 shadow-primary-600/20"
              >
                <Plus size={20} /> Add New Teacher
              </button>
            </div>
          </div>

          {/* Alerts within Sticky Section */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}
          {success && (
            <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 font-medium text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
              <CheckCircle2 size={18} className="text-green-500" />
              {success}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">

      {/* Teachers Table */}
      <div className="glass-card overflow-hidden bg-white border-slate-200 shadow-sm transition-all duration-300">
        <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
           <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
             <User size={16} className="text-slate-400" />
             Teacher Master Directory
           </h2>
           <span className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full border border-slate-300/30 whitespace-nowrap">
             {teachers.length} Total Teachers
           </span>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-[24%]">Teacher Name</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-[16%]">Contact Info</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-[20%]">Assigned School</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-[13%]">Joined On</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center w-[27%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                       <div className="h-8 w-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                       <p className="text-sm font-medium">Loading teacher directory...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                       <User size={48} className="opacity-20 mb-2" />
                       <p className="text-lg font-bold text-slate-400">No teachers found</p>
                       <p className="text-sm">Try adjusting your search or register a new teacher.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs ring-2 ring-white">
                          {teacher.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm group-hover:text-primary-600 transition-colors uppercase tracking-tight">{teacher.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                          <Phone size={12} className="text-blue-500" />
                          {teacher.mobileNo}
                        </div>
                        {teacher.email && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 italic">
                            <Mail size={11} className="shrink-0" />
                            {teacher.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <School size={14} className="text-slate-400" />
                        <span className={`text-xs font-bold ${teacher.schoolName === 'Unassigned' ? 'text-red-500 italic' : 'text-slate-700'}`}>
                          {teacher.schoolName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium italic">
                        <Calendar size={14} className="text-slate-400" />
                        {formatDate(teacher.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleTransferClick(teacher)}
                          className="px-3 py-1.5 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-all text-xs flex items-center gap-2 font-bold"
                          title="Transfer to another school"
                        >
                          <ArrowRightLeft size={14} /> Transfer
                        </button>
                        <button
                          onClick={() => handleEdit(teacher)}
                          className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-all text-xs flex items-center gap-2 font-bold"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(teacher)}
                          className="px-3 py-1.5 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-all text-xs flex items-center gap-2 font-bold"
                        >
                          <Trash2 size={14} /> Delete
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
      <TeacherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        initialData={editingTeacher}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6">
                <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                   <Trash2 size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Teacher?</h3>
                <p className="text-slate-500 text-sm mb-6">
                   Are you sure you want to delete the account for <span className="font-semibold text-slate-700">{teacherToDelete?.name}</span>? This will revoke their access and hide them from the directory.
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
                     ) : (
                       <>
                         <Trash2 size={14} /> Delete Teacher
                       </>
                     )}
                   </button>
                </div>
             </div>
           </div>
        </div>
      )}

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <ArrowRightLeft size={24} />
                </div>
                <button
                  onClick={() => setIsTransferModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Transfer Teacher</h3>
              <p className="text-slate-500 text-sm mb-6">
                Transfer <span className="font-semibold text-slate-700">{teacherToTransfer?.name}</span> to another school.
              </p>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">New Target School</label>
                <Dropdown
                  options={schools.filter(s => s.name !== teacherToTransfer?.schoolName).map(s => ({ id: s.schoolId, label: s.name }))}
                  selected={transferSchoolId}
                  onChange={(id) => setTransferSchoolId(id)}
                  placeholder="-- Select School --"
                />
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => setIsTransferModalOpen(false)}
                disabled={transferLoading}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmTransfer}
                disabled={transferLoading || !transferSchoolId}
                className="px-6 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {transferLoading ? (
                   <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ArrowRightLeft size={14} /> Transfer Teacher
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ManageTeachers;
