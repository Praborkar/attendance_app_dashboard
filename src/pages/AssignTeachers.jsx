import { useState, useEffect } from 'react';
import { UserMinus, UserPlus, Users, Search, School, AlertTriangle, X, ArrowRightLeft, Trash2 } from 'lucide-react';
import Dropdown from '../components/Dropdown';
import api from '../api/axiosConfig';

const AssignTeachers = () => {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');

  const [unassignedTeachers, setUnassignedTeachers] = useState([]);
  const [assignedTeachers, setAssignedTeachers] = useState([]);

  const [loadingSchools, setLoadingSchools] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Unassign Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [teacherToUnassign, setTeacherToUnassign] = useState(null);

  // Transfer Modal State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [teacherToTransfer, setTeacherToTransfer] = useState(null);
  const [transferSchoolId, setTransferSchoolId] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 1. Fetch schools on mount
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

  // 2. Fetch teachers when selected school changes
  useEffect(() => {
    if (selectedSchool) {
      fetchTeachers(selectedSchool);
    } else {
      setAssignedTeachers([]);
      setUnassignedTeachers([]);
    }
  }, [selectedSchool]);

  const fetchSchools = async () => {
    try {
      setLoadingSchools(true);
      const res = await api.get('/schools');
      setSchools(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedSchool(res.data[0].schoolId);
      }
    } catch (err) {
      setError('Failed to fetch schools list.');
    } finally {
      setLoadingSchools(false);
    }
  };

  const fetchTeachers = async (schoolId) => {
    try {
      setLoadingTeachers(true);
      setError('');

      const [assignedRes, unassignedRes] = await Promise.all([
        api.get(`/admin/schools/${schoolId}/teachers`),
        api.get('/admin/teachers/unassigned')
      ]);

      setAssignedTeachers(assignedRes.data || []);
      setUnassignedTeachers(unassignedRes.data || []);
    } catch (err) {
      setError('Failed to fetch teachers for the selected school.');
      setAssignedTeachers([]);
      setUnassignedTeachers([]);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleAssign = async (teacher) => {
    if (!selectedSchool || !teacher?.id) return;

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      await api.post(`/admin/schools/${selectedSchool}/assign-teacher`, { teacherId: teacher.id });

      const schoolName = schools.find(s => s.schoolId === selectedSchool)?.name || 'School';
      setSuccess(`Assigned ${teacher.name} to ${schoolName}`);

      fetchTeachers(selectedSchool);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign teacher.');
    } finally {
      setActionLoading(false);
    }
  };

  const initiateUnassign = (teacher) => {
    setTeacherToUnassign(teacher);
    setShowConfirmModal(true);
  };

  const confirmUnassign = async () => {
    if (!selectedSchool || !teacherToUnassign) return;

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      await api.post(`/admin/schools/${selectedSchool}/unassign-teacher`, { teacherId: teacherToUnassign.id });

      const schoolName = schools.find(s => s.schoolId === selectedSchool)?.name || 'School';
      setSuccess(`Removed ${teacherToUnassign.name} from ${schoolName}`);

      fetchTeachers(selectedSchool);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove teacher.');
    } finally {
      setActionLoading(false);
      setShowConfirmModal(false);
      setTeacherToUnassign(null);
    }
  };

  // ============ TRANSFER ============
  const openTransferModal = (teacher) => {
    setTeacherToTransfer(teacher);
    setTransferSchoolId('');
    setShowTransferModal(true);
  };

  const handleTransfer = async () => {
    if (!transferSchoolId) {
      setError('Please select a target school.');
      return;
    }
    try {
      setTransferLoading(true);
      setError('');
      await api.put(`/admin/teachers/${teacherToTransfer.id}/transfer`, {
        newSchoolId: transferSchoolId
      });
      setSuccess(`${teacherToTransfer.name} transferred successfully!`);
      setShowTransferModal(false);
      fetchTeachers(selectedSchool);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to transfer teacher.');
    } finally {
      setTransferLoading(false);
    }
  };

  // ============ DELETE ============
  const openDeleteModal = (teacher) => {
    setTeacherToDelete(teacher);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      setError('');
      await api.delete(`/admin/teachers/${teacherToDelete.id}`);
      setSuccess(`${teacherToDelete.name} removed from the system.`);
      setShowDeleteModal(false);
      fetchTeachers(selectedSchool);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to delete teacher.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 relative">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assign Teachers</h1>
        <p className="text-slate-500 text-sm mt-1">Manage teacher deployments across schools.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium text-sm">
          {error}
        </div>
      )}

      {/* Floating Toast Message */}
      {success && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 font-medium text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            {success}
          </div>
        </div>
      )}

      {/* School Selector */}
      <div className="glass-card p-6 mb-8 relative z-20">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Select a School</label>
        {loadingSchools ? (
          <div className="h-11 bg-slate-100 rounded-xl animate-pulse"></div>
        ) : (
          <Dropdown
            options={schools.map(s => ({ id: s.schoolId, label: `${s.name} (${s.address})` }))}
            selected={selectedSchool}
            onChange={(id) => setSelectedSchool(id)}
            placeholder="-- Choose a School --"
          />
        )}
      </div>

      {selectedSchool ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Unassigned Teachers (Available Pool) */}
          <div className="glass-card overflow-hidden flex flex-col h-[600px]">
            <div className="bg-slate-50 border-b border-slate-100 p-4 shrink-0 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <UserPlus size={18} className="text-blue-500" />
                  Available Teachers
                </h2>
                <p className="text-xs text-slate-500">Not assigned to any school</p>
              </div>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                {unassignedTeachers?.length || 0}
              </span>
            </div>

            <div className="overflow-y-auto p-4 flex-1">
              {loadingTeachers ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
                </div>
              ) : !unassignedTeachers || unassignedTeachers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Search size={32} className="mb-3 opacity-50" />
                  <p className="text-sm font-medium">No available teachers found.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {unassignedTeachers.map(teacher => (
                    <li key={teacher.id} className="p-4 border border-slate-200 rounded-xl bg-white hover:border-blue-300 transition-colors flex items-center justify-between group">
                      <div className="min-w-0 pr-4">
                        <p className="font-bold text-slate-800 truncate">{teacher.name}</p>
                        <p className="text-xs text-slate-500 truncate">{teacher.mobileNo || 'No Mobile Available'}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleAssign(teacher)}
                          disabled={actionLoading}
                          className="btn-outline border-blue-200 text-blue-600 hover:bg-blue-50 py-1.5 px-3 text-sm flex items-center gap-2"
                        >
                          <UserPlus size={14} /> Add
                        </button>
                        <button
                          onClick={() => openDeleteModal(teacher)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-xs flex items-center gap-2"
                        >
                          Delete <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Assigned Teachers (Current School) */}
          <div className="glass-card overflow-hidden flex flex-col h-[600px]">
            <div className="bg-primary-50 border-b border-primary-100 p-4 shrink-0 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-primary-900 flex items-center gap-2">
                  <Users size={18} className="text-primary-600" />
                  Assigned to this School
                </h2>
                <p className="text-xs text-primary-600/80">Currently teaching here</p>
              </div>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
                {assignedTeachers?.length || 0}
              </span>
            </div>

            <div className="overflow-y-auto p-4 flex-1 bg-white">
              {loadingTeachers ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />)}
                </div>
              ) : !assignedTeachers || assignedTeachers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Users size={32} className="mb-3 opacity-50" />
                  <p className="text-sm font-medium">No teachers assigned yet.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {assignedTeachers.map(teacher => (
                    <li key={teacher.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md transition-all flex items-center justify-between group">
                      <div className="min-w-0 pr-4">
                        <p className="font-bold text-slate-800 truncate">{teacher.name}</p>
                        <p className="text-xs text-slate-500 truncate">{teacher.mobileNo || 'No Mobile Available'}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => openTransferModal(teacher)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors text-xs flex items-center gap-2"
                        >
                          Transfer <ArrowRightLeft size={14} />
                        </button>
                        <button
                          onClick={() => initiateUnassign(teacher)}
                          disabled={actionLoading}
                          className="btn-outline border-red-200 text-red-600 hover:bg-red-50 py-1.5 px-3 text-sm flex items-center gap-2"
                        >
                          <UserMinus size={14} /> Remove
                        </button>
                        <button
                          onClick={() => openDeleteModal(teacher)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-xs flex items-center gap-2"
                        >
                          Delete <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      ) : (
        !loadingSchools && (
          <div className="text-center p-12 glass-card border-dashed">
            <School size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-700">No School Selected</h3>
            <p className="text-slate-500 text-sm mt-1">Please select a school to manage its teachers.</p>
          </div>
        )
      )}

      {/* ============ UNASSIGN CONFIRMATION MODAL ============ */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Remove Teacher?</h3>
              <p className="text-slate-500 text-sm">
                Are you sure you want to unassign <span className="font-semibold text-slate-700">{teacherToUnassign?.name}</span> from this school? They will be moved back to the available pool.
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmUnassign}
                disabled={actionLoading}
                className="px-6 py-2 font-medium text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 rounded-xl transition-all text-sm flex items-center relative overflow-hidden"
              >
                {actionLoading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Removing...
                  </div>
                ) : (
                  "Yes, Remove Teacher"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ TRANSFER MODAL ============ */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <ArrowRightLeft size={24} />
                </div>
                <button
                  onClick={() => setShowTransferModal(false)}
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">New School</label>
                <Dropdown
                  options={schools.filter(s => s.schoolId !== selectedSchool).map(s => ({ id: s.schoolId, label: s.name }))}
                  selected={transferSchoolId}
                  onChange={(id) => setTransferSchoolId(id)}
                  placeholder="-- Select School --"
                />
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => setShowTransferModal(false)}
                disabled={transferLoading}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={transferLoading || !transferSchoolId}
                className="px-6 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 rounded-xl transition-all text-sm disabled:opacity-50"
              >
                {transferLoading ? 'Transferring...' : 'Transfer Teacher'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ DELETE MODAL ============ */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Teacher?</h3>
              <p className="text-slate-500 text-sm">
                Are you sure you want to permanently remove <span className="font-semibold text-slate-700">{teacherToDelete?.name}</span> from the organization? This action cannot be undone.
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-6 py-2 font-medium text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 rounded-xl transition-all text-sm"
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete Teacher'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AssignTeachers;
