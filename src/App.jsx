import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import DashboardOverview from './pages/DashboardOverview';
import AssignTeachers from './pages/AssignTeachers';
import ManageStudents from './pages/ManageStudents';
import AddTeacher from './pages/AddTeacher';
import ManageSchools from './pages/ManageSchools';
import DailyAttendance from './pages/DailyAttendance';
import TeacherAttendance from './pages/TeacherAttendance';
import ManageTeachers from './pages/ManageTeachers';

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
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="assign-teachers" element={<AssignTeachers />} />
          <Route path="manage-students" element={<ManageStudents />} />
          <Route path="add-teacher" element={<AddTeacher />} />
          <Route path="attendance" element={<DailyAttendance />} />
          <Route path="teacher-attendance" element={<TeacherAttendance />} />
          <Route path="manage-teachers" element={<ManageTeachers />} />
          <Route path="manage-schools" element={<ManageSchools />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
