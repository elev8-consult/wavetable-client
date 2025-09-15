import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { getAttendanceById, updateAttendance } from '../../api/attendance';
import { useParams, useNavigate } from 'react-router-dom';

export default function AttendanceEdit() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAttendanceById(id).then(res => setItem(res.data)).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateAttendance(id, item);
    navigate('/attendance');
  };

  if (loading) return <MainLayout><div>Loading...</div></MainLayout>;
  if (!item) return <MainLayout><div>Not found</div></MainLayout>;

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Edit Attendance</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input value={item.status || ''} onChange={e => setItem({ ...item, status: e.target.value })} placeholder="Status (present/absent)" />
        <input type="datetime-local" value={item.sessionDate ? new Date(item.sessionDate).toISOString().slice(0,16) : ''} onChange={e => setItem({ ...item, sessionDate: e.target.value })} />
        <button type="submit">Save</button>
      </form>
    </MainLayout>
  );
}
