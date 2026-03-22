import { useState, useEffect, useRef } from 'react';
import { School, Search, Clock, ChevronLeft, ChevronRight, AlertTriangle, Download, FileSpreadsheet, Filter, X, Users, GraduationCap, Fingerprint, Edit3 } from 'lucide-react';
import Dropdown from '../components/Dropdown';
import api from '../api/axiosConfig';

const AttendanceMonitoring = () => {
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [studentAttendance, setStudentAttendance] = useState({ 
        total: 0, presentCount: 0, absentCount: 0, records: [] 
    });
    const [teacherAttendance, setTeacherAttendance] = useState({ 
        total: 0, presentCount: 0, absentCount: 0, records: [] 
    });
    
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sourceFilter, setSourceFilter] = useState('ALL');

    const [loadingSchools, setLoadingSchools] = useState(false);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [exportingConsolidated, setExportingConsolidated] = useState(false);
    const [exportingSchool, setExportingSchool] = useState(false);
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

    // Fetch schools on mount
    useEffect(() => {
        fetchSchools();
    }, []);

    // Auto-dismiss alerts
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Fetch both attendance when school or date changes
    useEffect(() => {
        if (selectedSchool && selectedDate) {
            fetchBothAttendance(selectedSchool, selectedDate);
        }
    }, [selectedSchool, selectedDate]);

    // Click outside to close filters
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
            const data = res.data || [];
            setSchools(data);
            if (data.length > 0 && !selectedSchool) {
                setSelectedSchool(data[0].schoolId);
            }
        } catch (err) {
            setError('Failed to fetch schools.');
        } finally {
            setLoadingSchools(false);
        }
    };

    const fetchBothAttendance = async (schoolId, date) => {
        try {
            setLoadingAttendance(true);
            setError('');
            
            // Parallel fetch
            const [studentRes, teacherRes] = await Promise.all([
                api.get('/reports/attendance/monitoring', { params: { schoolId, date } }),
                api.get('/reports/teacher-attendance/monitoring', { params: { schoolId, date } })
            ]);
            
            const sData = studentRes.data || {};
            const tData = teacherRes.data || {};

            setStudentAttendance({
                total: sData.totalStudents || 0,
                presentCount: sData.presentCount || 0,
                absentCount: sData.absentCount || 0,
                records: sData.records || []
            });

            setTeacherAttendance({
                total: tData.totalTeachers || 0,
                presentCount: tData.presentCount || 0,
                absentCount: tData.absentCount || 0,
                records: tData.records || []
            });
        } catch (err) {
            setError('Failed to fetch attendance data.');
            setStudentAttendance({ total: 0, presentCount: 0, absentCount: 0, records: [] });
            setTeacherAttendance({ total: 0, presentCount: 0, absentCount: 0, records: [] });
        } finally {
            setLoadingAttendance(false);
        }
    };

    const changeDate = (days) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const handleExport = async (type) => {
        try {
            if (type === 'school') setExportingSchool(true);
            else setExportingConsolidated(true);
            
            const endpoint = type === 'school' ? '/reports/export/school' : '/reports/export/consolidated';
            const params = type === 'school' ? { schoolId: selectedSchool, date: selectedDate } : { date: selectedDate };

            const response = await api.get(endpoint, {
                params,
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const schoolName = schools.find(s => s.schoolId === selectedSchool)?.name || '';
            const fileName = type === 'school' 
                ? `attendance_report_${schoolName}_${selectedDate}.xlsx` 
                : `attendance_report_consolidated_${selectedDate}.xlsx`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError('Failed to export Excel report.');
        } finally {
            setExportingSchool(false);
            setExportingConsolidated(false);
        }
    };

    const getFilteredRecords = (records, isStudents = true) => {
        return (records || []).filter(record => {
            const matchesStatus = statusFilter === 'ALL' || record.status === statusFilter;
            const matchesSource = sourceFilter === 'ALL' || (
                sourceFilter === 'FINGERPRINT' ? record.source === 'FINGERPRINT' : 
                sourceFilter === 'MANUAL' ? record.source !== 'FINGERPRINT' && record.status !== 'ABSENT' : true
            );
            
            const searchLower = searchQuery.toLowerCase();
            const primaryName = isStudents ? (record.studentName || '') : (record.teacherName || '');
            const secondaryField = isStudents ? String(record.rollNumber || '') : (record.mobileNumber || '');
            
            const matchesSearch = primaryName.toLowerCase().includes(searchLower) || secondaryField.includes(searchQuery);

            return matchesStatus && matchesSource && matchesSearch;
        }).sort((a, b) => {
            if (isStudents) return (a.rollNumber || 0) - (b.rollNumber || 0);
            return 0;
        });
    };

    const formatTime = (dateTimeStr) => {
        if (!dateTimeStr) return 'N/A';
        const dateInput = (dateTimeStr.endsWith('Z') || dateTimeStr.includes('+')) ? dateTimeStr : `${dateTimeStr}Z`;
        return new Date(dateInput).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <div className="pb-12 px-4 md:px-8 max-w-[1600px] mx-auto">
            {/* Sticky Header Section */}
            <div className="sticky top-0 z-50 bg-slate-50 border-b border-slate-200/50 mb-8 transition-all duration-200">
                <div className="py-8 pb-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Reports</h1>
                            <p className="text-slate-500 text-sm mt-1">Monitor and export daily attendance across the school.</p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleExport('consolidated')}
                                disabled={exportingConsolidated}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all duration-200 shadow-md shadow-slate-900/20"
                            >
                                {exportingConsolidated ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <FileSpreadsheet size={18} />}
                                Consolidated Report
                            </button>
                            {selectedSchool && (
                                <button
                                    onClick={() => handleExport('school')}
                                    disabled={exportingSchool}
                                    className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm shadow-emerald-500/20"
                                >
                                    {exportingSchool ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Download size={18} />}
                                    School Report
                                </button>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium text-sm flex items-center gap-2">
                            <AlertTriangle size={18} /> {error}
                        </div>
                    )}

                    {/* Main Controls Hub */}
                    <div className="glass-card p-6 relative z-30">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    {/* School Filter */}
                    <div className="min-w-0">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Select School</label>
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
                                <input
                                    type="date"
                                    className="input-field uppercase tracking-wider text-sm font-semibold"
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
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Search Records</label>
                        <div className="relative">
                            <Search size={18} className="absolute inset-y-0 left-3 my-auto text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                className="input-field !pl-10 !pr-10 bg-white"
                                placeholder="Search students or teachers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-3 my-auto text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div className="max-w-[1600px] mx-auto">
        {/* Side-by-Side Rosters Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative z-10">
                {/* Students Roster */}
                <RosterCard 
                    title="Student Roster"
                    data={studentAttendance}
                    records={getFilteredRecords(studentAttendance.records, true)}
                    isStudents={true}
                    loading={loadingAttendance}
                    formatTime={formatTime}
                    filterRefs={{ statusRef, sourceRef }}
                    filterStates={{ 
                        statusOpen, setStatusOpen, 
                        sourceOpen, setSourceOpen,
                        statusFilter, setStatusFilter,
                        sourceFilter, setSourceFilter
                    }}
                    options={{ statusOptions, sourceOptions }}
                    showSpecificFilters={true} // Show filters on Student table header
                />

                {/* Teachers Roster */}
                <RosterCard 
                    title="Teacher Roster"
                    data={teacherAttendance}
                    records={getFilteredRecords(teacherAttendance.records, false)}
                    isStudents={false}
                    loading={loadingAttendance}
                    formatTime={formatTime}
                    filterRefs={{ statusRef: null, sourceRef: null }}
                    filterStates={{ 
                        statusOpen: false, setStatusOpen, 
                        sourceOpen: false, setSourceOpen,
                        statusFilter, setStatusFilter,
                        sourceFilter, setSourceFilter
                    }}
                    options={{ statusOptions, sourceOptions }}
                    showSpecificFilters={false} // Only need one set of filter popovers
                />
            </div>
        </div>
    </div>
    );
};

// Internal Helper Component for Roster Cards
const RosterCard = ({ 
    title, data, records, isStudents, loading, formatTime,
    filterRefs, filterStates, options, showSpecificFilters
}) => {
    const { statusRef, sourceRef } = filterRefs;
    const { 
        statusOpen, setStatusOpen, 
        sourceOpen, setSourceOpen,
        statusFilter, setStatusFilter,
        sourceFilter, setSourceFilter
    } = filterStates;
    const { statusOptions, sourceOptions } = options;

    return (
        <div className="glass-card flex flex-col h-full bg-white shadow-sm border-slate-200">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-primary-600 shrink-0" />
                    <h2 className="font-bold text-slate-800 text-sm truncate">
                        {title}
                    </h2>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 ">
                    <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-300">
                        Total: {data.total}
                    </span>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        Present: {data.presentCount}
                    </span>
                    <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">
                        Absent: {data.absentCount}
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white border-b border-slate-100 text-sm">
                            <th className="py-3 px-4 font-semibold text-[10px] text-slate-500 uppercase tracking-wider w-[32%]">Name</th>
                            <th className="py-3 px-4 font-semibold text-[10px] text-slate-500 uppercase tracking-wider w-[17%]">
                                {isStudents ? 'Roll No' : 'Mobile'}
                            </th>
                            <th className="py-3 px-4 font-semibold text-[10px] text-slate-500 uppercase tracking-wider w-[17%] relative" ref={statusRef}>
                                <div 
                                    className="flex items-center gap-2 cursor-pointer hover:text-primary-600 transition-colors"
                                    onClick={() => setStatusOpen(!statusOpen)}
                                >
                                    <span>Status</span>
                                    <div className="relative">
                                        <Filter size={12} className={statusFilter !== 'ALL' ? 'text-primary-500 fill-primary-50' : 'text-slate-400'} />
                                        {statusFilter !== 'ALL' && (
                                            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
                                        )}
                                    </div>
                                </div>
                                {statusOpen && statusRef && (
                                    <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-slate-100 rounded-lg shadow-xl z-[60] p-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                        {statusOptions.map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => { setStatusFilter(opt.id); setStatusOpen(false); }}
                                                className={`w-full text-left px-2 py-1.5 rounded-md text-[10px] font-bold transition-colors ${statusFilter === opt.id ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </th>
                            <th className="py-3 px-4 font-semibold text-[10px] text-slate-500 uppercase tracking-wider w-[17%] relative" ref={sourceRef}>
                                <div 
                                    className="flex items-center gap-2 cursor-pointer hover:text-primary-600 transition-colors"
                                    onClick={() => setSourceOpen(!sourceOpen)}
                                >
                                    <span>Source</span>
                                    <div className="relative">
                                        <Filter size={12} className={sourceFilter !== 'ALL' ? 'text-primary-500 fill-primary-50' : 'text-slate-400'} />
                                        {sourceFilter !== 'ALL' && (
                                            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
                                        )}
                                    </div>
                                </div>
                                {sourceOpen && sourceRef && (
                                    <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-slate-100 rounded-lg shadow-xl z-[60] p-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                        {sourceOptions.map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => { setSourceFilter(opt.id); setSourceOpen(false); }}
                                                className={`w-full text-left px-2 py-1.5 rounded-md text-[10px] font-bold transition-colors ${sourceFilter === opt.id ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </th>
                            <th className="py-3 px-4 font-semibold text-[10px] text-slate-500 uppercase tracking-wider w-[17%] text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 bg-white">
                        {loading ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <tr key={i}><td colSpan="5" className="py-3 px-4"><div className="h-6 bg-slate-50 rounded animate-pulse" /></td></tr>
                            ))
                        ) : records.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-12 text-center text-slate-400">
                                    <p className="text-xs font-medium">No records found</p>
                                </td>
                            </tr>
                        ) : (
                            records.map((record, index) => (
                                <tr key={index} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-3 px-4 font-bold text-slate-800 text-[11px] truncate max-w-[150px]">
                                        {isStudents ? record.studentName : record.teacherName}
                                    </td>
                                    <td className="py-3 px-4 font-mono text-slate-600 text-[10px]">
                                        {isStudents ? record.rollNumber : (record.mobileNumber || 'N/A')}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${record.status === 'PRESENT'
                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                            : 'bg-red-100 text-red-700 border border-red-200'
                                            }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1.5 text-slate-600 text-[9px]">
                                            {record.status === 'ABSENT' ? '-' : (
                                                record.source === 'FINGERPRINT' 
                                                ? <><Fingerprint size={10} className="text-primary-500" /> Device</>
                                                : <><Edit3 size={10} className="text-orange-500" /> Manual</>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-right font-medium text-slate-500 text-[10px]">
                                        {record.status === 'ABSENT' ? '-' : formatTime(record.markedAt)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceMonitoring;
