import { useState, useEffect } from 'react';
import { School, UserCircle2, Search, ArrowRightLeft, Trash2, Upload, X, AlertTriangle, Pencil } from 'lucide-react';
import Dropdown from '../components/Dropdown';
import api from '../api/axiosConfig';

const ViewStudents = () => {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');

  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [loadingSchools, setLoadingSchools] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Transfer Modal State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [studentToTransfer, setStudentToTransfer] = useState(null);
  const [transferSchoolId, setTransferSchoolId] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', gender: '', dob: '', level: '' });
  const [editLoading, setEditLoading] = useState(false);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Bulk Upload Modal State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

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

  // 2. Fetch students when selected school changes
  useEffect(() => {
    if (selectedSchool) {
      fetchStudents(selectedSchool);
    } else {
      setStudents([]);
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
      setError('Failed to fetch schools.');
    } finally {
      setLoadingSchools(false);
    }
  };

  const fetchStudents = async (schoolId) => {
    try {
      setLoadingStudents(true);
      setError('');

      const res = await api.get(`/admin/schools/${schoolId}/students`);
      setStudents(res.data || []);
      setSearchQuery('');
    } catch (err) {
      setError('Failed to fetch students for this school.');
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // ============ TRANSFER ============
  const openTransferModal = (student) => {
    setStudentToTransfer(student);
    setTransferSchoolId('');
    setShowTransferModal(true);
  };

  const handleTransfer = async () => {
    if (!transferSchoolId) {
      setError('Please select a school.');
      return;
    }
    try {
      setTransferLoading(true);
      setError('');
      await api.put(`/admin/schools/students/${studentToTransfer.studentId}/transfer`, {
        newSchoolId: transferSchoolId
      });
      setSuccess(`${studentToTransfer.name} transferred successfully!`);
      setShowTransferModal(false);
      fetchStudents(selectedSchool);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to transfer student.');
    } finally {
      setTransferLoading(false);
    }
  };

  // ============ EDIT Student ============
  const openEditModal = (student) => {
    setStudentToEdit(student);
    setEditForm({
      name: student.name || '',
      gender: student.gender || '',
      dob: student.dob || '',
      level: student.level || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateStudent = async () => {
    try {
      setEditLoading(true);
      setError('');
      await api.put(`/admin/schools/students/${studentToEdit.studentId}`, editForm);
      setSuccess(`${editForm.name} updated successfully!`);
      setShowEditModal(false);
      fetchStudents(selectedSchool);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to update student.');
    } finally {
      setEditLoading(false);
    }
  };

  // ============ DELETE ============
  const openDeleteModal = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      setError('');
      await api.delete(`/admin/schools/students/${studentToDelete.studentId}`);
      setSuccess(`${studentToDelete.name} removed successfully.`);
      setShowDeleteModal(false);
      fetchStudents(selectedSchool);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to delete student.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ============ BULK UPLOAD ============
  const handleBulkUpload = async () => {
    if (!bulkFile) {
      setError('Please select a CSV or Excel file.');
      return;
    }
    const fileName = bulkFile.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      setError('Invalid file format. Please upload a .csv or .xlsx file.');
      return;
    }
    try {
      setBulkLoading(true);
      setError('');
      const formData = new FormData();
      formData.append('file', bulkFile);
      const res = await api.post('/admin/schools/students/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(res.data || 'Students uploaded successfully!');
      setShowBulkModal(false);
      setBulkFile(null);
      if (selectedSchool) fetchStudents(selectedSchool);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to upload CSV.');
    } finally {
      setBulkLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchQuery.toLowerCase();
    const safeName = student.name || '';
    const safeRoll = student.rollNumber || '';
    const safeLevel = student.level || '';

    return safeName.toLowerCase().includes(searchLower) ||
      String(safeRoll).toLowerCase().includes(searchLower) ||
      safeLevel.toLowerCase().includes(searchLower);
  });

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">View Students</h1>
          <p className="text-slate-500 text-sm mt-1">Browse the roster of enrolled students per school.</p>
        </div>
        <button
          onClick={() => setShowBulkModal(true)}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
        >
          <Upload size={16} /> Bulk Upload CSV
        </button>
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

      {/* Controls Bar */}
      <div className="glass-card p-6 mb-8 flex flex-col md:flex-row gap-4 items-end relative z-20">
        <div className="w-full md:w-1/2 min-w-0">
          <label className="block text-sm font-semibold text-slate-700 mb-2 whitespace-nowrap">Select School Filter</label>
          {loadingSchools ? (
            <div className="h-11 w-full bg-slate-100 rounded-xl animate-pulse"></div>
          ) : (
            <Dropdown
              icon={School}
              options={schools.map(s => ({ id: s.schoolId, label: `${s.name} (${s.address})` }))}
              selected={selectedSchool}
              onChange={(id) => setSelectedSchool(id)}
              placeholder="-- Choose a School --"
            />
          )}
        </div>

        <div className="w-full md:w-1/2 min-w-0">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Search Students</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              className="input-field !pl-10 bg-white"
              placeholder="Search by name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!selectedSchool || students.length === 0}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {selectedSchool ? (
        <div className="glass-card overflow-hidden">
          {/* List Header */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">
              Student List of {schools.find(s => s.schoolId === selectedSchool)?.name || 'Selected School'}
            </h2>
            <span className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
              {filteredStudents.length} Students
            </span>
          </div>

          <div className="p-0">
            {loadingStudents ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
              </div>
            ) : students.length === 0 ? (
              <div className="text-center p-16">
                <UserCircle2 size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-700">No Students Found</h3>
                <p className="text-slate-500 text-sm mt-1">This school doesn't have any enrolled students yet.</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center p-16">
                <Search size={40} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-700">No matches found</h3>
                <p className="text-slate-500 text-sm mt-1">Try adjusting your search query.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-100">
                      <th className="py-4 px-6 font-semibold text-sm text-slate-500 uppercase tracking-wider">Student Name</th>
                      <th className="py-4 px-6 font-semibold text-sm text-slate-500 uppercase tracking-wider">Level</th>
                      <th className="py-4 px-6 font-semibold text-sm text-slate-500 uppercase tracking-wider">Roll Number</th>
                      <th className="py-4 px-6 font-semibold text-sm text-slate-500 uppercase tracking-wider">Gender</th>
                      <th className="py-4 px-6 font-semibold text-sm text-slate-500 uppercase tracking-wider">DOB</th>
                      <th className="py-4 px-6 font-semibold text-sm text-slate-500 uppercase tracking-wider">Age</th>
                      <th className="py-4 px-6 font-semibold text-sm text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student, index) => (
                      <tr key={student.studentId} className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs uppercase">
                              {(student.name || '?').charAt(0)}
                            </div>
                            <span className="font-medium text-slate-800">{student.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-600 text-xs">
                           <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                             {student.level || 'N/A'}
                           </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-slate-600">
                          {student.rollNumber || 'N/A'}
                        </td>
                        <td className="py-4 px-6">
                           <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                             student.gender === 'MALE' ? 'bg-blue-50 text-blue-600' : 
                             student.gender === 'FEMALE' ? 'bg-pink-50 text-pink-600' : 
                             'bg-slate-50 text-slate-600'
                           }`}>
                             {student.gender || 'N/A'}
                           </span>
                        </td>
                        <td className="py-4 px-6 text-slate-600 text-sm">
                          {student.dob ? new Date(student.dob).toLocaleDateString('en-GB').split('/').join('-') : 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-slate-600 text-sm">
                          {student.age ?? 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(student)}
                              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-xs flex items-center gap-2"
                            >
                              Edit <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => openTransferModal(student)}
                              className="px-3 py-1.5 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors text-xs flex items-center gap-2"
                            >
                              Transfer <ArrowRightLeft size={14} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(student)}
                              className="px-3 py-1.5 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-xs flex items-center gap-2"
                            >
                              Delete <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        !loadingSchools && (
          <div className="text-center p-12 glass-card border-dashed">
            <School size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-700">Select a School</h3>
            <p className="text-slate-500 text-sm mt-1">You must select a school to view its student roster.</p>
          </div>
        )
      )}

      {/* ============ TRANSFER MODAL ============ */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
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
              <h3 className="text-xl font-bold text-slate-900 mb-2">Transfer Student</h3>
              <p className="text-slate-500 text-sm mb-6">
                Transfer <span className="font-semibold text-slate-700">{studentToTransfer?.name}</span> to another school.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New School</label>
                  <select
                    className="input-field bg-white w-full"
                    value={transferSchoolId}
                    onChange={(e) => setTransferSchoolId(e.target.value)}
                  >
                    <option value="">-- Select School --</option>
                    {schools.filter(s => s.schoolId !== selectedSchool).map(s => (
                      <option key={s.schoolId} value={s.schoolId}>{s.name}</option>
                    ))}
                  </select>
                </div>
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
                {transferLoading ? 'Transferring...' : 'Transfer Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ EDIT MODAL ============ */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <Pencil size={24} />
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Edit Student Details</h3>
              <p className="text-slate-500 text-sm mb-6">
                Update information for <span className="font-semibold text-slate-700">{studentToEdit?.name}</span>. Roll No and Age are system-managed.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="input-field bg-white w-full"
                    placeholder="Enter student name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Level</label>
                  <input
                    type="text"
                    className="input-field bg-white w-full"
                    placeholder="e.g: Level 1"
                    value={editForm.level}
                    onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
                  <select
                    className="input-field bg-white w-full"
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    className="input-field bg-white w-full"
                    value={editForm.dob}
                    onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Roll Number (Read-only)</label>
                  <input
                    type="text"
                    className="input-field bg-slate-50 w-full cursor-not-allowed"
                    value={studentToEdit?.rollNumber || ''}
                    disabled
                  />
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStudent}
                disabled={editLoading}
                className="px-6 py-2 font-medium text-white bg-slate-800 hover:bg-slate-900 shadow-md shadow-slate-800/20 rounded-xl transition-all text-sm disabled:opacity-50"
              >
                {editLoading ? 'Updating...' : 'Save Changes'}
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
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Student?</h3>
              <p className="text-slate-500 text-sm">
                Are you sure you want to remove <span className="font-semibold text-slate-700">{studentToDelete?.name}</span> from the system? This student will no longer appear in the roster.
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
                {deleteLoading ? 'Deleting...' : 'Yes, Delete Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ BULK UPLOAD MODAL ============ */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Upload size={24} />
                </div>
                <button
                  onClick={() => { setShowBulkModal(false); setBulkFile(null); }}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Bulk Student Upload</h3>
              <p className="text-slate-500 text-sm mb-3">
                Upload a CSV or Excel file with columns: <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">Student Name</span>, <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">Level</span>, <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">School Name</span>, <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">Gender</span>, <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">DOB</span>
              </p>

              <a
                href="/sample_bulk_upload.csv"
                download="sample_bulk_upload.csv"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline mb-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Download Sample CSV
              </a>

              <label className="block w-full cursor-pointer">
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${bulkFile ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-slate-400'}`}>
                  {bulkFile ? (
                    <div>
                      <Upload size={32} className="mx-auto text-emerald-500 mb-2" />
                      <p className="text-sm font-medium text-emerald-700">{bulkFile.name}</p>
                      <p className="text-xs text-slate-500 mt-1">Click to change file</p>
                    </div>
                  ) : (
                    <div>
                      <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                      <p className="text-sm font-medium text-slate-600">Click to select CSV file</p>
                      <p className="text-xs text-slate-400 mt-1">or drag and drop</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  className="hidden"
                  onChange={(e) => setBulkFile(e.target.files[0])}
                />
              </label>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => { setShowBulkModal(false); setBulkFile(null); }}
                disabled={bulkLoading}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpload}
                disabled={bulkLoading || !bulkFile}
                className="px-6 py-2 font-medium text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 rounded-xl transition-all text-sm disabled:opacity-50"
              >
                {bulkLoading ? 'Uploading...' : 'Upload Students'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewStudents;
