import { useState, useEffect } from 'react';
import { Calendar, School, Download, UserCheck, Users, Fingerprint, Keyboard, AlertCircle } from 'lucide-react';
import api from '../api/axiosConfig';
import Dropdown from '../components/Dropdown';

const AttendanceMonitor = () => {
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [studentAttendance, setStudentAttendance] = useState([]);
    const [teacherAttendance, setTeacherAttendance] = useState([]);

    const [loadingSchools, setLoadingSchools] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSchools();
    }, []);

    useEffect(() => {
        fetchAttendance();
    }, [selectedSchool, selectedDate]);

    const fetchSchools = async () => {
        try {
            setLoadingSchools(true);
            const res = await api.get('/schools');
            setSchools(res.data || []);
        } catch (err) {
            setError('Failed to load schools.');
        } finally {
            setLoadingSchools(false);
        }
    };

    const fetchAttendance = async () => {
        try {
            setLoadingData(true);
            setError('');
            const res = await api.get('/admin/attendance/daily', {
                params: {
                    schoolId: selectedSchool || undefined,
                    date: selectedDate
                }
            });
            setStudentAttendance(res.data.students || []);
            setTeacherAttendance(res.data.teachers || []);
        } catch (err) {
            setError('Failed to fetch attendance records.');
        } finally {
            setLoadingData(false);
        }
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const res = await api.get('/admin/attendance/export', {
                params: { date: selectedDate },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Attendance_Report_${selectedDate}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError('Failed to export Excel report.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Monitor</h1>
                    <p className="text-slate-500 text-sm mt-1">Cross-school daily attendance overview and reporting.</p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
                >
                    {exporting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Download size={16} />
                    )}
                    {exporting ? 'Generating...' : 'Export Daily Report'}
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card p-6 mb-8 flex flex-col md:flex-row gap-6 items-end relative z-20">
                <div className="w-full md:w-1/3">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Filter by School</label>
                    {loadingSchools ? (
                        <div className="h-11 w-full bg-slate-100 rounded-xl animate-pulse"></div>
                    ) : (
                        <Dropdown
                            icon={School}
                            options={[{ id: '', label: 'All Schools' }, ...schools.map(s => ({ id: s.schoolId, label: s.name }))]}
                            selected={selectedSchool}
                            onChange={setSelectedSchool}
                            placeholder="All Schools"
                        />
                    )}
                </div>

                <div className="w-full md:w-1/3">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Select Date</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Calendar size={18} />
                        </div>
                        <input
                            type="date"
                            className="input-field !pl-10 bg-white"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3 text-sm font-medium">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Student Attendance Section */}
                <div className="glass-card flex flex-col min-h-[500px]">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                            <Users size={18} className="text-primary-600" />
                            Student Attendance
                        </h2>
                        <span className="bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">
                            {studentAttendance.length} Records
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loadingData ? (
                            <div className="p-6 space-y-4">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />)}
                            </div>
                        ) : studentAttendance.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12">
                                <Users size={32} className="mb-3 opacity-20" />
                                <p className="text-sm font-medium">No student attendance marked yet for this day.</p>
                            </div>
                        ) : (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="text-left border-b border-slate-100">
                                        <th className="py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
                                        <th className="py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Source</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {studentAttendance.map((record, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3 px-6">
                                                <div className="font-medium text-slate-800">{record.studentName}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">Roll: {record.rollNumber || 'N/A'}</div>
                                            </td>
                                            <td className="py-3 px-6">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${record.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' :
                                                        record.status === 'ABSENT' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-6">
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    {record.source === 'FINGERPRINT' ? (
                                                        <><Fingerprint size={14} className="text-primary-500" /> Fingerprint</>
                                                    ) : (
                                                        <><Keyboard size={14} className="text-slate-400" /> Manual</>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Teacher Attendance Section */}
                <div className="glass-card flex flex-col min-h-[500px]">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                            <UserCheck size={18} className="text-emerald-600" />
                            Teacher Attendance
                        </h2>
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                            {teacherAttendance.length} Records
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loadingData ? (
                            <div className="p-6 space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />)}
                            </div>
                        ) : teacherAttendance.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12">
                                <UserCheck size={32} className="mb-3 opacity-20" />
                                <p className="text-sm font-medium">No teacher attendance marked yet for this day.</p>
                            </div>
                        ) : (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="text-left border-b border-slate-100">
                                        <th className="py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Teacher</th>
                                        <th className="py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {teacherAttendance.map((record, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3 px-6 font-medium text-slate-800">
                                                {record.teacherName}
                                            </td>
                                            <td className="py-3 px-6 text-right">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${record.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' :
                                                        record.status === 'ABSENT' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AttendanceMonitor;
