import { useState, useEffect, useRef } from 'react';
import { School, Search, Calendar, Fingerprint, Edit3, Clock, ChevronLeft, ChevronRight, AlertTriangle, UserCheck, Filter } from 'lucide-react';
import Dropdown from '../components/Dropdown';
import api from '../api/axiosConfig';

const TeacherAttendance = () => {
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [attendance, setAttendance] = useState({ 
        totalTeachers: 0, 
        presentCount: 0, 
        absentCount: 0, 
        records: [] 
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sourceFilter, setSourceFilter] = useState('ALL');

    const [loadingSchools, setLoadingSchools] = useState(false);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [error, setError] = useState('');
    
    // Filter Popover State
    const [statusOpen, setStatusOpen] = useState(false);
    const [sourceOpen, setSourceOpen] = useState(false);
    const statusRef = useRef(null);
    const sourceRef = useRef(null);

    const statusOptions = [
        { id: 'ALL', label: 'All Statuses' },
        { id: 'PRESENT', label: 'Present' },
        { id: 'ABSENT', label: 'Absent' }
    ];

    const sourceOptions = [
        { id: 'ALL', label: 'All Sources' },
        { id: 'FINGERPRINT', label: 'Device' },
        { id: 'MANUAL', label: 'Manual' }
    ];

    // 1. Fetch schools on mount
    useEffect(() => {
        fetchSchools();
    }, []);

    // Auto-dismiss alerts
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // 2. Fetch attendance when school or date changes
    useEffect(() => {
        if (selectedSchool && selectedDate) {
            fetchAttendance(selectedSchool, selectedDate);
        }
    }, [selectedSchool, selectedDate]);

    // 3. Click outside to close filters
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (statusRef.current && !statusRef.current.contains(event.target)) setStatusOpen(false);
            if (sourceRef.current && !sourceRef.current.contains(event.target)) setSourceOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const fetchAttendance = async (schoolId, date) => {
        try {
            setLoadingAttendance(true);
            setError('');
            const res = await api.get('/reports/teacher-attendance/monitoring', {
                params: { schoolId, date }
            });

            // Backwards compatibility: Handle both old Array and new DTO responses
            if (Array.isArray(res.data)) {
                const records = res.data;
                const presentCount = records.filter(r => r.status === 'PRESENT').length;
                setAttendance({
                    totalTeachers: records.length,
                    presentCount: presentCount,
                    absentCount: records.length - presentCount,
                    records: records
                });
            } else {
                setAttendance(res.data || { totalTeachers: 0, presentCount: 0, absentCount: 0, records: [] });
            }
        } catch (err) {
            setError('Failed to fetch teacher attendance for this date.');
            setAttendance({ totalTeachers: 0, presentCount: 0, absentCount: 0, records: [] });
        } finally {
            setLoadingAttendance(false);
        }
    };

    const changeDate = (days) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const filteredAttendance = (attendance.records || []).filter(record => {
        const matchesStatus = statusFilter === 'ALL' || record.status === statusFilter;
        const matchesSource = sourceFilter === 'ALL' || (
            sourceFilter === 'FINGERPRINT' ? record.source === 'FINGERPRINT' : 
            sourceFilter === 'MANUAL' ? record.source !== 'FINGERPRINT' && record.status !== 'ABSENT' : true
        );
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = (record.teacherName || '').toLowerCase().includes(searchLower) ||
            String(record.mobileNumber || '').includes(searchQuery);

        return matchesStatus && matchesSource && matchesSearch;
    });

    const formatTime = (dateTimeStr) => {
        if (!dateTimeStr) return 'N/A';
        const dateInput = (dateTimeStr.endsWith('Z') || dateTimeStr.includes('+'))
            ? dateTimeStr
            : `${dateTimeStr}Z`;
        return new Date(dateInput).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Teacher Attendance Monitoring</h1>
                    <p className="text-slate-500 text-sm mt-1">View daily attendance rosters for teachers across registered schools.</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium text-sm flex items-center gap-2">
                    <AlertTriangle size={18} /> {error}
                </div>
            )}

            {/* Controls Bar */}
            <div className="glass-card p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-end relative z-20">
                {/* School Filter */}
                <div className="min-w-0">
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

                {/* Date Selector */}
                <div className="min-w-0">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Select Date</label>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => changeDate(-1)}
                            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="relative flex-1">
                            <Calendar size={18} className="absolute inset-y-0 left-3 my-auto text-slate-400 pointer-events-none" />
                            <input
                                type="date"
                                className="input-field !pl-10 bg-white"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <button
                            onClick={() => changeDate(1)}
                            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            disabled={selectedDate === new Date().toISOString().split('T')[0]}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="min-w-0">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Search Teachers</label>
                    <div className="relative">
                        <Search size={18} className="absolute inset-y-0 left-3 my-auto text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            className="input-field !pl-10 bg-white"
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Roster Table */}
            <div className="glass-card overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <Clock size={18} className="text-primary-600" />
                        Teacher Attendance for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-slate-200 text-slate-700 text-[10px] uppercase tracking-tighter font-black px-2.5 py-1 rounded-lg border border-slate-300">
                            Total: {attendance.totalTeachers}
                        </span>
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase tracking-tighter font-black px-2.5 py-1 rounded-lg border border-emerald-200">
                            Present: {attendance.presentCount}
                        </span>
                        <span className="bg-red-100 text-red-700 text-[10px] uppercase tracking-tighter font-black px-2.5 py-1 rounded-lg border border-red-200">
                            Absent: {attendance.absentCount}
                        </span>
                    </div>
                </div>

                <div className="p-0">
                    {loadingAttendance ? (
                        <div className="p-12 space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white border-b border-slate-100">
                                        <th className="py-4 px-6 font-semibold text-xs text-slate-500 uppercase tracking-wider">Teacher Name</th>
                                        <th className="py-4 px-6 font-semibold text-xs text-slate-500 uppercase tracking-wider">Mobile No</th>
                                        <th className="py-4 px-6 font-semibold text-xs text-slate-500 uppercase tracking-wider relative" ref={statusRef}>
                                            <div 
                                                className="flex items-center gap-2 cursor-pointer hover:text-primary-600 transition-colors"
                                                onClick={() => setStatusOpen(!statusOpen)}
                                            >
                                                <span>Status</span>
                                                <Filter size={14} className={statusFilter !== 'ALL' ? 'text-primary-500 fill-primary-50' : 'text-slate-400'} />
                                            </div>
                                            
                                            {statusOpen && (
                                                <div className="absolute top-full left-6 mt-1 w-40 bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/50 z-50 p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    {statusOptions.map(opt => (
                                                        <button
                                                            key={opt.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setStatusFilter(opt.id);
                                                                setStatusOpen(false);
                                                            }}
                                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                                                                statusFilter === opt.id 
                                                                ? 'bg-primary-50 text-primary-700' 
                                                                : 'text-slate-600 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </th>
                                        <th className="py-4 px-6 font-semibold text-xs text-slate-500 uppercase tracking-wider relative" ref={sourceRef}>
                                            <div 
                                                className="flex items-center gap-2 cursor-pointer hover:text-primary-600 transition-colors"
                                                onClick={() => setSourceOpen(!sourceOpen)}
                                            >
                                                <span>Source</span>
                                                <Filter size={14} className={sourceFilter !== 'ALL' ? 'text-primary-500 fill-primary-50' : 'text-slate-400'} />
                                            </div>

                                            {sourceOpen && (
                                                <div className="absolute top-full left-6 mt-1 w-40 bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/50 z-50 p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    {sourceOptions.map(opt => (
                                                        <button
                                                            key={opt.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSourceFilter(opt.id);
                                                                setSourceOpen(false);
                                                            }}
                                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                                                                sourceFilter === opt.id 
                                                                ? 'bg-primary-50 text-primary-700' 
                                                                : 'text-slate-600 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </th>
                                        <th className="py-4 px-6 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right">Marked At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 bg-white">
                                    {filteredAttendance.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-20 text-center">
                                                <div className="flex flex-col items-center justify-center text-slate-400">
                                                    <Search size={48} className="mb-4 opacity-20" />
                                                    <p className="text-lg font-medium text-slate-500">No matching records found</p>
                                                    <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or search query</p>
                                                    {(statusFilter !== 'ALL' || sourceFilter !== 'ALL' || searchQuery) && (
                                                        <button 
                                                            onClick={() => {
                                                                setStatusFilter('ALL');
                                                                setSourceFilter('ALL');
                                                                setSearchQuery('');
                                                            }}
                                                            className="mt-4 text-primary-600 font-bold text-sm hover:underline"
                                                        >
                                                            Clear all filters
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAttendance.map((record, index) => (
                                            <tr key={index} className="hover:bg-slate-50 transition-colors group">
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-slate-800">{record.teacherName}</div>
                                                </td>
                                                <td className="py-4 px-6 font-mono text-slate-600 text-sm">
                                                    {record.mobileNumber}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${record.status === 'PRESENT'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        {record.status === 'ABSENT' ? (
                                                            <span className="text-slate-400 font-medium">N/A</span>
                                                        ) : record.source === 'FINGERPRINT' ? (
                                                            <><Fingerprint size={16} className="text-primary-500" /> Device</>
                                                        ) : (
                                                            <><Edit3 size={16} className="text-orange-500" /> Manual</>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right font-medium text-slate-500 text-sm">
                                                    {formatTime(record.markedAt)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherAttendance;
