import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Users, UserCheck } from 'lucide-react';
import api from '../api/axiosConfig';

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalStudents: 0,
    totalTeachers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
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

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/admin');
      if (res.data) {
        setStats({
          totalSchools: res.data.totalSchools || 0,
          totalStudents: res.data.totalStudents || 0,
          totalTeachers: res.data.totalTeachers || 0,
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
      className={`glass-card p-6 flex items-center justify-between border-l-4 ${borderClass} transition-transform hover:-translate-y-1 duration-300 cursor-pointer group`}
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

  return (
    <div className="pb-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">High-level statistics across all registered schools.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center justify-between">
          <span className="font-medium">{error}</span>
          <button onClick={fetchStats} className="text-sm underline hover:text-red-800">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          icon={Users} 
          colorClass="bg-purple-50 text-purple-600"
          borderClass="border-l-purple-500"
          path="/manage-students"
        />
      </div>
      
      {/* Decorative empty state space filler */}
      <div className="mt-12 opacity-40 select-none pointer-events-none">
         <img src="https://illustrations.popsy.co/amber/student-going-to-school.svg" alt="Illustration" className="mx-auto h-64 opacity-60 grayscale" />
         <p className="text-center text-slate-400 font-medium mt-4">System Running Smoothly</p>
      </div>
    </div>
  );
};

export default DashboardOverview;
