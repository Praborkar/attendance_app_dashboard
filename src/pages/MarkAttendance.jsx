import { useState } from 'react';
import { UserCheck, Clock, CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import api from '../api/axiosConfig';

const MarkAttendance = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const handleMark = async (status) => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            await api.post('/teachers/attendance', { status });

            setSuccess(`Your attendance for today has been marked as ${status}!`);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || 'Failed to mark attendance. You may have already marked it for today.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight text-center sm:text-left">Self Attendance</h1>
                <p className="text-slate-500 text-sm mt-1 text-center sm:text-left">Mark your presence for today to keep your records updated.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Info Card */}
                <div className="md:col-span-1">
                    <div className="glass-card p-6 bg-primary-600 text-white border-0">
                        <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                            <UserCheck size={24} />
                        </div>
                        <h2 className="text-lg font-bold mb-2">Hello, {user.name}!</h2>
                        <p className="text-primary-100 text-sm leading-relaxed mb-6">
                            Please mark your attendance before starting your day.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 text-sm">
                                <Clock size={16} className="mt-0.5 opacity-70" />
                                <div>
                                    <p className="font-semibold">{today}</p>
                                    <p className="opacity-70 text-xs">Current Date</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                        <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                            Note: You can only mark your attendance once per day.
                        </p>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="md:col-span-2 space-y-6">
                    {success && (
                        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 flex items-center gap-3 font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                            <CheckCircle2 size={20} />
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3 font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <div className="glass-card p-8 text-center sm:text-left">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Daily Presence</h3>
                        <p className="text-slate-500 text-sm mb-8">What is your status for today?</p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button
                                onClick={() => handleMark('PRESENT')}
                                disabled={loading || success}
                                className={`group p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${success ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed' :
                                        'border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700'
                                    }`}
                            >
                                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <CheckCircle2 size={24} />
                                </div>
                                <span className="font-bold">Present</span>
                            </button>

                            <button
                                onClick={() => handleMark('ABSENT')}
                                disabled={loading || success}
                                className={`group p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${success ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed' :
                                        'border-red-100 hover:border-red-500 hover:bg-red-50 text-slate-700'
                                    }`}
                            >
                                <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <XCircle size={24} />
                                </div>
                                <span className="font-bold">Absent</span>
                            </button>

                            <button
                                onClick={() => handleMark('LEAVE')}
                                disabled={loading || success}
                                className={`group p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${success ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed' :
                                        'border-amber-100 hover:border-amber-500 hover:bg-amber-50 text-slate-700'
                                    }`}
                            >
                                <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Info size={24} />
                                </div>
                                <span className="font-bold">On Leave</span>
                            </button>
                        </div>

                        {loading && (
                            <div className="mt-8 flex items-center justify-center gap-3 text-primary-600 font-medium animate-pulse">
                                <div className="w-5 h-5 border-3 border-current border-t-transparent rounded-full animate-spin" />
                                Recording your response...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarkAttendance;
