import { useState, useEffect } from 'react';
import { School, UserCircle2, Search } from 'lucide-react';
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

  // 1. Fetch schools on mount
  useEffect(() => {
    fetchSchools();
  }, []);

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
      setSearchQuery(''); // Reset search when switching schools
    } catch (err) {
      setError('Failed to fetch students for this school.');
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchQuery.toLowerCase();
    const safeName = student.name || '';
    const safeRoll = student.rollNumber || '';
    
    return safeName.toLowerCase().includes(searchLower) || 
           String(safeRoll).toLowerCase().includes(searchLower);
  });

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">View Students</h1>
          <p className="text-slate-500 text-sm mt-1">Browse the roster of enrolled students per school.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium text-sm">
          {error}
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
                {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse"/>)}
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
                      <th className="py-4 px-6 font-semibold text-sm text-slate-500 uppercase tracking-wider">Roll Number</th>
                      <th className="py-4 px-6 font-semibold text-sm text-slate-500 uppercase tracking-wider text-right">Identifier</th>
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
                        <td className="py-4 px-6 font-mono text-slate-600">
                          {student.rollNumber || 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-400 font-mono text-right">
                           #{student.studentId?.substring(0,8)}...
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
    </div>
  );
};

export default ViewStudents;
