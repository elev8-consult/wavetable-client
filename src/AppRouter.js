import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect } from 'react';
import { getMe } from './api/auth';
import ClientsList from './pages/Clients/ClientsList';
import ClientCreate from './pages/Clients/ClientCreate';
import ClientEdit from './pages/Clients/ClientEdit';
import ClientDetail from './pages/Clients/ClientDetail';
import CalendarPage from './pages/Calendar/CalendarPage';
import EquipmentList from './pages/Equipment/EquipmentList';
import EquipmentCreate from './pages/Equipment/EquipmentCreate';
import EquipmentEdit from './pages/Equipment/EquipmentEdit';
import EquipmentDetail from './pages/Equipment/EquipmentDetail';
import RoomsList from './pages/Rooms/RoomsList';
import RoomCreate from './pages/Rooms/RoomCreate';
import RoomEdit from './pages/Rooms/RoomEdit';
import RoomDetail from './pages/Rooms/RoomDetail';
import BookingsList from './pages/Bookings/BookingsList';
import BookingCreate from './pages/Bookings/BookingCreate';
import BookingEdit from './pages/Bookings/BookingEdit';
import BookingDetail from './pages/Bookings/BookingDetail';
import ClassesList from './pages/Classes/ClassesList';
import ClassCreate from './pages/Classes/ClassCreate';
import ClassEdit from './pages/Classes/ClassEdit';
import ClassDetail from './pages/Classes/ClassDetail';
import EnrollmentsList from './pages/Enrollments/EnrollmentsList';
import EnrollmentCreate from './pages/Enrollments/EnrollmentCreate';
import EnrollmentEdit from './pages/Enrollments/EnrollmentEdit';
import EnrollmentDetail from './pages/Enrollments/EnrollmentDetail';
import AttendanceList from './pages/Attendance/AttendanceList';
import AttendanceCreate from './pages/Attendance/AttendanceCreate';
import AttendanceEdit from './pages/Attendance/AttendanceEdit';
import AttendanceDetail from './pages/Attendance/AttendanceDetail';
import PaymentsList from './pages/Payments/PaymentsList';
import PaymentCreate from './pages/Payments/PaymentCreate';
import PaymentEdit from './pages/Payments/PaymentEdit';
import PaymentDetail from './pages/Payments/PaymentDetail';

export default function AppRouter() {
  const isAuthenticated = !!localStorage.getItem('token');
  // Validate token on app start
  useEffect(() => {
    if (!isAuthenticated) return;
    getMe().catch(() => {
      try { localStorage.removeItem('token'); } catch (e) {}
      window.location.href = '/login';
    });
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/clients" element={
          <ProtectedRoute>
            <ClientsList />
          </ProtectedRoute>
        } />
        <Route path="/equipment" element={
          <ProtectedRoute>
            <EquipmentList />
          </ProtectedRoute>
        } />
        <Route path="/equipment/create" element={
          <ProtectedRoute>
            <EquipmentCreate />
          </ProtectedRoute>
        } />
        <Route path="/equipment/:id/edit" element={
          <ProtectedRoute>
            <EquipmentEdit />
          </ProtectedRoute>
        } />
        <Route path="/equipment/:id" element={
          <ProtectedRoute>
            <EquipmentDetail />
          </ProtectedRoute>
        } />
        <Route path="/rooms" element={
          <ProtectedRoute>
            <RoomsList />
          </ProtectedRoute>
        } />
        <Route path="/rooms/create" element={
          <ProtectedRoute>
            <RoomCreate />
          </ProtectedRoute>
        } />
        <Route path="/rooms/:id/edit" element={
          <ProtectedRoute>
            <RoomEdit />
          </ProtectedRoute>
        } />
        <Route path="/rooms/:id" element={
          <ProtectedRoute>
            <RoomDetail />
          </ProtectedRoute>
        } />
        <Route path="/bookings" element={
          <ProtectedRoute>
            <BookingsList />
          </ProtectedRoute>
        } />
        <Route path="/bookings/create" element={
          <ProtectedRoute>
            <BookingCreate />
          </ProtectedRoute>
        } />
        <Route path="/bookings/:id/edit" element={
          <ProtectedRoute>
            <BookingEdit />
          </ProtectedRoute>
        } />
        <Route path="/bookings/:id" element={
          <ProtectedRoute>
            <BookingDetail />
          </ProtectedRoute>
        } />
        <Route path="/classes" element={
          <ProtectedRoute>
            <ClassesList />
          </ProtectedRoute>
        } />
        <Route path="/classes/create" element={
          <ProtectedRoute>
            <ClassCreate />
          </ProtectedRoute>
        } />
        <Route path="/classes/:id/edit" element={
          <ProtectedRoute>
            <ClassEdit />
          </ProtectedRoute>
        } />
        <Route path="/classes/:id" element={
          <ProtectedRoute>
            <ClassDetail />
          </ProtectedRoute>
        } />
        <Route path="/enrollments" element={
          <ProtectedRoute>
            <EnrollmentsList />
          </ProtectedRoute>
        } />
        <Route path="/enrollments/create" element={
          <ProtectedRoute>
            <EnrollmentCreate />
          </ProtectedRoute>
        } />
        <Route path="/enrollments/:id/edit" element={
          <ProtectedRoute>
            <EnrollmentEdit />
          </ProtectedRoute>
        } />
        <Route path="/enrollments/:id" element={
          <ProtectedRoute>
            <EnrollmentDetail />
          </ProtectedRoute>
        } />
        <Route path="/attendance" element={
          <ProtectedRoute>
            <AttendanceList />
          </ProtectedRoute>
        } />
        <Route path="/attendance/create" element={
          <ProtectedRoute>
            <AttendanceCreate />
          </ProtectedRoute>
        } />
        <Route path="/attendance/:id/edit" element={
          <ProtectedRoute>
            <AttendanceEdit />
          </ProtectedRoute>
        } />
        <Route path="/attendance/:id" element={
          <ProtectedRoute>
            <AttendanceDetail />
          </ProtectedRoute>
        } />
        <Route path="/payments" element={
          <ProtectedRoute>
            <PaymentsList />
          </ProtectedRoute>
        } />
        <Route path="/payments/create" element={
          <ProtectedRoute>
            <PaymentCreate />
          </ProtectedRoute>
        } />
        <Route path="/payments/:id/edit" element={
          <ProtectedRoute>
            <PaymentEdit />
          </ProtectedRoute>
        } />
        <Route path="/payments/:id" element={
          <ProtectedRoute>
            <PaymentDetail />
          </ProtectedRoute>
        } />
        <Route path="/clients/create" element={
          <ProtectedRoute>
            <ClientCreate />
          </ProtectedRoute>
        } />
        <Route path="/clients/:id/edit" element={
          <ProtectedRoute>
            <ClientEdit />
          </ProtectedRoute>
        } />
        <Route path="/clients/:id" element={
          <ProtectedRoute>
            <ClientDetail />
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        } />
        {/* Add more protected routes for other modules here */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}
