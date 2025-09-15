import React from 'react';
import MainLayout from '../components/MainLayout';
import DashboardSummary from '../components/DashboardSummary';

export default function Dashboard() {
  return (
    <MainLayout>
      <h1>Dashboard</h1>
      <p style={{ color: '#39ff14' }}>Welcome to the Studio Management System!</p>
      <DashboardSummary />
    </MainLayout>
  );
}
