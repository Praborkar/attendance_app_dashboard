import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, School, LogOut, ClipboardList } from 'lucide-react';
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
    { name: 'Student Attendance', path: '/attendance', icon: <ClipboardList size={20} /> },
    { name: 'Teacher Attendance', path: '/teacher-attendance', icon: <UserPlus size={20} /> },
    { name: 'Assign Teachers', path: '/assign-teachers', icon: <Users size={20} /> },
    { name: 'View Students', path: '/view-students', icon: <Users size={20} /> },
    { name: 'Add Teacher', path: '/add-teacher', icon: <UserPlus size={20} /> },
    { name: 'Manage Teachers', path: '/manage-teachers', icon: <Users size={20} /> },
    { name: 'Manage Schools', path: '/manage-schools', icon: <School size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm hidden md:flex">
        <div className="p-6 flex flex-col items-center justify-center border-b border-slate-100 gap-3">
          <img src={logo} alt="Attendance App Logo" className="w-16 h-16 object-contain" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent tracking-tight text-center text-balance">
            Attendance Admin
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive
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

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="flex items-center text-sm font-medium text-slate-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{userName}</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm border border-primary-200">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
