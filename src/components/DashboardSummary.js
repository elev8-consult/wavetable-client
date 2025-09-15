import React, { useEffect, useState } from 'react';
import { getSummary } from '../api/dashboard';

export default function DashboardSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getSummary()
      .then(res => {
        setSummary(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load dashboard data');
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ color: '#39ff14' }}>Loading dashboard...</div>;
  if (error) return <div style={{ color: '#ff3b3b' }}>{error}</div>;
  if (!summary) return null;

  return (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '2rem' }}>
      <SummaryCard label="Clients" value={summary.totalClients} />
      <SummaryCard label="Bookings" value={summary.totalBookings} />
      <SummaryCard label="Classes" value={summary.totalClasses} />
      <SummaryCard label="Total Income" value={summary.totalIncome + ' $'} />
      <SummaryCard label="Outstanding" value={summary.totalOutstanding + ' $'} />
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div style={{
      background: '#111',
      border: '2px solid #39ff14',
      borderRadius: 12,
      padding: '1.5rem 2.5rem',
      minWidth: 160,
      textAlign: 'center',
      color: '#fff',
      boxShadow: '0 2px 16px rgba(0,255,128,0.08)'
    }}>
      <div style={{ color: '#39ff14', fontSize: 22, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 15, marginTop: 8 }}>{label}</div>
    </div>
  );
}
