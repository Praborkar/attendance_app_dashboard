import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import DashboardOverview from './pages/DashboardOverview';
import AssignTeachers from './pages/AssignTeachers';
import ViewStudents from './pages/ViewStudents';
import AddTeacher from './pages/AddTeacher';
import AddSchool from './pages/AddSchool';
import AttendanceMonitor from './pages/AttendanceMonitor';
import MarkAttendance from './pages/MarkAttendance';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={
            JSON.parse(localStorage.getItem('user') || '{}').role === 'ADMIN'
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/mark-attendance" replace />
          } />
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="attendance-monitor" element={<AttendanceMonitor />} />
          <Route path="mark-attendance" element={<MarkAttendance />} />
          <Route path="assign-teachers" element={<AssignTeachers />} />
          <Route path="view-students" element={<ViewStudents />} />
          <Route path="add-teacher" element={<AddTeacher />} />
          <Route path="add-school" element={<AddSchool />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
