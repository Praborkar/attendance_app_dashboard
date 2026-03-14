import { useState, useEffect } from 'react';
import { School, Search, Calendar, Fingerprint, Edit3, Clock, ChevronLeft, ChevronRight, AlertTriangle, Download, FileSpreadsheet } from 'lucide-react';
import Dropdown from '../components/Dropdown';
import api from '../api/axiosConfig';

const DailyAttendance = () => {
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [attendance, setAttendance] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [loadingSchools, setLoadingSchools] = useState(false);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState('');

    // 1. Fetch schools on mount
    useEffect(() => {
        fetchSchools();
    }, []);

    // 2. Fetch attendance when school or date changes
    useEffect(() => {
        if (selectedSchool && selectedDate) {
            fetchAttendance(selectedSchool, selectedDate);
        }
    }, [selectedSchool, selectedDate]);

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
            const res = await api.get('/reports/attendance/monitoring', {
                params: { schoolId, date }
            });
            setAttendance(res.data || []);
        } catch (err) {
            setError('Failed to fetch attendance for this date.');
            setAttendance([]);
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
            setExporting(true);
            const endpoint = type === 'school' ? '/reports/export/school' : '/reports/export/consolidated';
            const params = type === 'school' ? { schoolId: selectedSchool, date: selectedDate } : { date: selectedDate };

            const response = await api.get(endpoint, {
                params,
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const fileName = type === 'school' ? `attendance_report_${selectedDate}.xlsx` : `attendance_consolidated_${selectedDate}.xlsx`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError('Failed to export Excel report.');
        } finally {
            setExporting(false);
        }
    };

    const filteredAttendance = attendance.filter(record => {
        const searchLower = searchQuery.toLowerCase();
        return (record.studentName || '').toLowerCase().includes(searchLower) ||
            String(record.rollNumber || '').includes(searchQuery);
    });

    const formatTime = (dateTimeStr) => {
        if (!dateTimeStr) return 'N/A';
        return new Date(dateTimeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Attendance Monitoring</h1>
                    <p className="text-slate-500 text-sm mt-1">View daily attendance rosters captured via mobile app or devices.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleExport('consolidated')}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition-all shadow-sm disabled:opacity-50"
                    >
                        <FileSpreadsheet size={18} />
                        Consolidated Report
                    </button>
                    {selectedSchool && (
                        <button
                            onClick={() => handleExport('school')}
                            disabled={exporting}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50"
                        >
                            <Download size={18} />
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
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Search Students</label>
                    <div className="relative">
                        <Search size={18} className="absolute inset-y-0 left-3 my-auto text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            className="input-field !pl-10 bg-white"
                            placeholder="Search by name or roll..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Roster Table */}
            <div className="glass-card overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <Clock size={18} className="text-primary-600" />
                        Attendance Roster for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </h2>
                    <span className="bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">
                        {filteredAttendance.length} Marked
                    </span>
                </div>

                <div className="p-0">
                    {loadingAttendance ? (
                        <div className="p-6 space-y-4">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
                        </div>
                    ) : filteredAttendance.length === 0 ? (
                        <div className="text-center py-20 bg-white">
                            <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900">No Attendance Records</h3>
                            <p className="text-slate-500 mt-1 max-w-xs mx-auto">No attendance data found for this school on the selected date.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white border-b border-slate-100">
                                        <th className="py-4 px-6 font-semibold text-sm text-slate-500 uppercase tracking-wider">Student Name</th>
                                        <th className="py-4 px-6 font-semibold text-sm text-slate-500 uppercase tracking-wider">Roll No</th>
                                        <th className="py-4 px-6 font-semibold text-sm text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="py-4 px-6 font-semibold text-sm text-slate-500 uppercase tracking-wider">Source</th>
                                        <th className="py-4 px-6 font-semibold text-sm text-slate-500 uppercase tracking-wider text-right">Marked At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 bg-white">
                                    {filteredAttendance.map((record, index) => (
                                        <tr key={index} className="hover:bg-slate-50 transition-colors group">
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-slate-800">{record.studentName}</div>
                                            </td>
                                            <td className="py-4 px-6 font-mono text-slate-600 text-sm">
                                                {record.rollNumber}
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
                                                    {record.source === 'FINGERPRINT' ? (
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
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailyAttendance;
