import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Users, UserCheck, PlusCircle, UserPlus, Upload, ChevronRight, GraduationCap } from 'lucide-react';
import api from '../api/axiosConfig';

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalStudents: 0,
    totalTeachers: 0,
    schoolSummaries: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchStats();
  }, [selectedDate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/dashboard/admin?date=${selectedDate}`);
      if (res.data) {
        setStats({
          totalSchools: res.data.totalSchools || 0,
          totalStudents: res.data.totalStudents || 0,
          totalTeachers: res.data.totalTeachers || 0,
          schoolSummaries: res.data.schoolSummaries || []
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, colorClass, borderClass, path }) => (
    <div 
      onClick={() => path && navigate(path)}
      className={`glass-card p-6 flex items-center justify-between border-l-4 ${borderClass} transition-transform hover:-translate-y-1 duration-300 cursor-pointer group shadow-sm`}
    >
      <div>
        <p className="text-sm font-semibold text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 group-hover:text-primary-600 transition-colors">
          {loading ? (
            <div className="h-9 w-16 bg-slate-200 rounded animate-pulse" />
          ) : (
            value
          )}
        </h3>
      </div>
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${colorClass} group-hover:scale-110 shadow-sm`}>
        <Icon size={28} />
      </div>
    </div>
  );

  const QuickAction = ({ title, subtitle, icon: Icon, onClick, color }) => (
    <button 
      onClick={onClick}
      className="flex-1 glass-card p-5 flex items-center gap-4 transition-all hover:bg-slate-50 hover:shadow-md group active:scale-95"
    >
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color} shadow-sm group-hover:scale-110 transition-transform`}>
        <Icon size={22} />
      </div>
      <div className="text-left">
        <p className="font-bold text-slate-800 text-sm leading-tight group-hover:text-primary-600 transition-colors">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      <ChevronRight size={16} className="ml-auto text-slate-300 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
    </button>
  );

  return (
    <div className="pb-12 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time overview of schools, teachers, and student attendance.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
           BACKEND CONNECTED
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center justify-between shadow-sm">
          <span className="font-medium text-sm">{error}</span>
          <button onClick={fetchStats} className="text-xs font-bold underline hover:text-red-800">Retry Loading</button>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Schools" 
          value={stats.totalSchools} 
          icon={School} 
          colorClass="bg-blue-50 text-blue-600"
          borderClass="border-l-blue-500"
          path="/manage-schools"
        />
        <StatCard 
          title="Total Teachers" 
          value={stats.totalTeachers} 
          icon={UserCheck} 
          colorClass="bg-green-50 text-green-600"
          borderClass="border-l-green-500"
          path="/manage-teachers"
        />
        <StatCard 
          title="Total Students" 
          value={stats.totalStudents} 
          icon={GraduationCap} 
          colorClass="bg-purple-50 text-purple-600"
          borderClass="border-l-purple-500"
          path="/manage-students"
        />
      </div>

      {/* Quick Actions Runner */}
      <div className="mb-8">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          Quick Management Actions
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <QuickAction 
            title="Register School" 
            subtitle="Setup a new location" 
            icon={PlusCircle} 
            color="bg-blue-50 text-blue-600"
            onClick={() => navigate('/manage-schools')}
          />
          <QuickAction 
            title="Add Teacher" 
            subtitle="Review or hire staff" 
            icon={UserPlus} 
            color="bg-emerald-50 text-emerald-600"
            onClick={() => navigate('/add-teacher')}
          />
          <QuickAction 
            title="Bulk Upload Students" 
            subtitle="Import CSV rosters" 
            icon={Upload} 
            color="bg-purple-50 text-purple-600"
            onClick={() => navigate('/manage-students')}
          />
        </div>
      </div>

      {/* Per School Attendance Summary */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h2 className="font-bold text-slate-800 tracking-tight">Today's Attendance Snapshot</h2>
            <p className="text-xs text-slate-500 mt-0.5">Summary of presence across all registered schools</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Viewing Data For:</span>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
            </div>
            <button 
              onClick={fetchStats}
              className="p-2 text-slate-400 hover:text-primary-600 hover:bg-slate-50 rounded-lg transition-all"
              title="Refresh Data"
            >
              <Users size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="py-4 px-6 font-semibold text-xs text-slate-500 uppercase tracking-wider">School Name</th>
                <th className="py-4 px-6 font-semibold text-xs text-slate-500 uppercase tracking-wider">Students (Today)</th>
                <th className="py-4 px-6 font-semibold text-xs text-slate-500 uppercase tracking-wider">Teachers (Today)</th>
                <th className="py-4 px-6 font-semibold text-xs text-slate-500 uppercase tracking-wider">Overall Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i}>
                    <td colSpan="4" className="p-6">
                      <div className="h-8 bg-slate-50 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : stats.schoolSummaries.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400">
                    <School size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">No school data available</p>
                  </td>
                </tr>
              ) : (
                stats.schoolSummaries.map((school) => {
                  const studentPercent = school.totalStudents > 0 
                    ? Math.round((school.presentStudents / school.totalStudents) * 100) 
                    : 0;
                  const teacherPercent = school.totalTeachers > 0 
                    ? Math.round((school.presentTeachers / school.totalTeachers) * 100) 
                    : 0;

                  return (
                    <tr key={school.schoolId} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-800 text-sm group-hover:text-primary-600 transition-colors">{school.schoolName}</p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className="text-slate-600">{school.presentStudents} / {school.totalStudents} Present</span>
                            <span className={studentPercent > 80 ? 'text-emerald-600' : 'text-slate-400'}>{studentPercent}%</span>
                          </div>
                          <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 rounded-full ${studentPercent > 80 ? 'bg-emerald-500' : 'bg-primary-500'}`}
                              style={{ width: `${studentPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className="text-slate-600">{school.presentTeachers} / {school.totalTeachers} Present</span>
                            <span className={teacherPercent > 80 ? 'text-emerald-600' : 'text-slate-400'}>{teacherPercent}%</span>
                          </div>
                          <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 rounded-full ${teacherPercent > 80 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                              style={{ width: `${teacherPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                           <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                             (studentPercent > 50 || school.totalStudents === 0) 
                             ? 'bg-emerald-50 text-emerald-600' 
                             : 'bg-amber-50 text-amber-600'
                           }`}>
                             {(studentPercent > 50 || school.totalStudents === 0) ? 'ACTIVE' : 'LOW ATTENDANCE'}
                           </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
