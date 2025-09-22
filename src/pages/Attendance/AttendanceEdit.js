import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { getAttendanceById, updateAttendance } from '../../api/attendance';
import { useParams, useNavigate } from 'react-router-dom';

const STATUS_OPTIONS = ['scheduled', 'present', 'absent', 'cancelled'];

export default function AttendanceEdit() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getAttendanceById(id)
      .then(res => setItem(res.data))
      .catch(() => setError('Failed to load attendance'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateAttendance(id, {
        status: item.status,
        sessionDate: item.sessionDate,
        notes: item.notes,
      });
      navigate('/attendance');
    } catch (err) {
      setError('Failed to update attendance');
    }
  };

  if (loading) return <MainLayout><div>Loading...</div></MainLayout>;
  if (!item) return <MainLayout><div>Not found</div></MainLayout>;

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Edit Attendance</h2>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420 }}>
        <label>Status</label>
        <select value={item.status || 'scheduled'} onChange={e => setItem({ ...item, status: e.target.value })}>
          {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <label>Session Date</label>
        <input
          type="datetime-local"
          value={item.sessionDate ? new Date(item.sessionDate).toISOString().slice(0, 16) : ''}
          onChange={e => setItem({ ...item, sessionDate: e.target.value })}
        />
        <label>Notes</label>
        <textarea value={item.notes || ''} onChange={e => setItem({ ...item, notes: e.target.value })} rows={3} />
        <button type="submit" className="btn btn-primary">Save</button>
      </form>
    </MainLayout>
  );
}
