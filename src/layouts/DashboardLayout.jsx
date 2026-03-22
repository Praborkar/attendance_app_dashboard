import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, School, LogOut, Fingerprint, GraduationCap } from 'lucide-react';
import logo from '../assets/mahavir_dashboard_logo.png';

const DashboardLayout = () => {
  const navigate = useNavigate();
  // Decode JWT to get user info if needed, or get from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'Admin User';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard Reports', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Student Attendance', path: '/attendance', icon: <Fingerprint size={20} /> },
    { name: 'Teacher Attendance', path: '/teacher-attendance', icon: <Fingerprint size={20} /> },
    { name: 'Manage Students', path: '/manage-students', icon: <GraduationCap size={20} /> },
    { name: 'Manage Teachers', path: '/manage-teachers', icon: <Users size={20} /> },
    { name: 'Manage Schools', path: '/manage-schools', icon: <School size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm hidden md:flex">
        <div className="p-6 flex flex-col items-center justify-center border-b border-slate-100 gap-2">
          <img src={logo} alt="Attendance App Logo" className="w-16 h-16 object-contain" />
          <div className="text-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent tracking-tight">
              Attendance Admin
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' })}
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium whitespace-nowrap ${isActive
                  ? 'bg-primary-50 text-primary-600 shadow-sm border border-primary-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs ring-2 ring-white">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-700 truncate">{userName}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-red-600 hover:bg-red-100/50 transition-colors font-bold text-xs"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <div className="flex-1 flex flex-col overflow-hidden">


        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
