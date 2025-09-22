import React, { useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { createAttendance } from '../../api/attendance';
import { useNavigate } from 'react-router-dom';

const STATUS_OPTIONS = ['scheduled', 'present', 'absent', 'cancelled'];

export default function AttendanceCreate() {
  const [bookingId, setBookingId] = useState('');
  const [clientId, setClientId] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [status, setStatus] = useState('scheduled');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createAttendance({ bookingId, clientId: clientId || undefined, sessionDate, status, notes });
      navigate('/attendance');
    } catch (err) {
      setError('Failed to create attendance');
    }
  };

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Add Attendance</h2>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420 }}>
        <input value={bookingId} onChange={e => setBookingId(e.target.value)} placeholder="Booking ID" required />
        <input value={clientId} onChange={e => setClientId(e.target.value)} placeholder="Client ID (optional)" />
        <input type="datetime-local" value={sessionDate} onChange={e => setSessionDate(e.target.value)} required />
        <select value={status} onChange={e => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes" rows={3} />
        <button type="submit" className="btn btn-primary">Create</button>
      </form>
    </MainLayout>
  );
}
