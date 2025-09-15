import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './MainLayout.css';

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  const links = [
    ['Dashboard', '/dashboard'],
    ['Clients', '/clients'],
    ['Equipment', '/equipment'],
    ['Rooms', '/rooms'],
    ['Bookings', '/bookings'],
    ['Classes', '/classes'],
    ['Enrollments', '/enrollments'],
    ['Attendance', '/attendance'],
    ['Payments', '/payments'],
    ['Calendar', '/calendar']
  ];

  return (
    <div className="main-layout">
      <aside className="sidebar">
        <div className="sidebar-title">Studio</div>
        <nav>
          {links.map(([label, to]) => (
            <Link key={to} to={to} className={location.pathname.startsWith(to) ? 'active' : ''}>{label}</Link>
          ))}
        </nav>
        <button className="btn btn-primary" onClick={handleLogout} style={{ marginTop: 12 }}>Logout</button>
      </aside>
      <main className="main-content">
        <div className="content-wrap container">
          {children}
        </div>
      </main>
    </div>
  );
}
