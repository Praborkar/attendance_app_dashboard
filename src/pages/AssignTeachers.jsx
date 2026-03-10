import { useState, useEffect } from 'react';
import { UserMinus, UserPlus, Users, Search } from 'lucide-react';
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

  // 1. Fetch schools on mount
  useEffect(() => {
    fetchSchools();
  }, []);

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

  const handleAssign = async (teacherId) => {
    if (!selectedSchool) return;
    
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      await api.post(`/admin/schools/${selectedSchool}/assign-teacher`, { teacherId });
      
      setSuccess('Teacher assigned successfully!');
      fetchTeachers(selectedSchool); // Refresh lists
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign teacher.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnassign = async (teacherId) => {
    if (!selectedSchool) return;
    
    // Safety confirm
    if (!window.confirm("Are you sure you want to remove this teacher from the school?")) return;

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      await api.post(`/admin/schools/${selectedSchool}/unassign-teacher`, { teacherId });
      
      setSuccess('Teacher removed successfully!');
      fetchTeachers(selectedSchool); // Refresh lists
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove teacher.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assign Teachers</h1>
        <p className="text-slate-500 text-sm mt-1">Manage teacher deployments across schools.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 font-medium text-sm transition-opacity">
          {success}
        </div>
      )}

      {/* School Selector */}
      <div className="glass-card p-6 mb-8">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Select a School</label>
        {loadingSchools ? (
          <div className="h-11 bg-slate-100 rounded-xl animate-pulse"></div>
        ) : (
          <select 
            className="input-field text-base font-medium"
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
          >
            <option value="" disabled>-- Choose a School --</option>
            {schools.map(s => (
              <option key={s.schoolId} value={s.schoolId}>
                {s.schoolName} ({s.location})
              </option>
            ))}
          </select>
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
                {unassignedTeachers.length}
              </span>
            </div>
            
            <div className="overflow-y-auto p-4 flex-1">
              {loadingTeachers ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse"/>)}
                </div>
              ) : unassignedTeachers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Search size={32} className="mb-3 opacity-50" />
                  <p className="text-sm font-medium">No available teachers found.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {unassignedTeachers.map(teacher => (
                    <li key={teacher.userId} className="p-4 border border-slate-200 rounded-xl bg-white hover:border-blue-300 transition-colors flex items-center justify-between group">
                      <div>
                        <p className="font-bold text-slate-800">{teacher.name}</p>
                        <p className="text-xs text-slate-500 truncate w-40">{teacher.email}</p>
                      </div>
                      <button 
                        onClick={() => handleAssign(teacher.userId)}
                        disabled={actionLoading}
                        className="btn-outline border-blue-200 text-blue-600 hover:bg-blue-50 py-1.5 px-3 text-sm flex items-center gap-2"
                      >
                        <UserPlus size={14} /> Add
                      </button>
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
              <span className="bg-primary-200 text-primary-800 text-xs font-bold px-2 py-1 rounded-full">
                {assignedTeachers.length}
              </span>
            </div>
            
            <div className="overflow-y-auto p-4 flex-1 bg-white">
              {loadingTeachers ? (
                <div className="space-y-3">
                  {[1,2].map(i => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse"/>)}
                </div>
              ) : assignedTeachers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Users size={32} className="mb-3 opacity-50" />
                  <p className="text-sm font-medium">No teachers assigned yet.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {assignedTeachers.map(teacher => (
                    <li key={teacher.userId} className="p-4 border border-slate-100 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md transition-all flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">{teacher.name}</p>
                        <p className="text-xs text-slate-500">{teacher.email}</p>
                      </div>
                      <button 
                        onClick={() => handleUnassign(teacher.userId)}
                        disabled={actionLoading}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Remove from school"
                      >
                        <UserMinus size={18} />
                      </button>
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
    </div>
  );
};

export default AssignTeachers;
