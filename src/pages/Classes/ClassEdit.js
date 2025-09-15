import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { getClassById, updateClass } from '../../api/classes';
import { getRooms } from '../../api/rooms';
import ScheduleBuilder from '../../components/ScheduleBuilder';
import { useParams, useNavigate } from 'react-router-dom';

export default function ClassEdit() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getClassById(id).then(res => setItem(res.data)).finally(() => setLoading(false));
    getRooms().then(r => setRooms(r.data || []));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateClass(id, item);
    navigate('/classes');
  };

  if (loading) return <MainLayout><div>Loading...</div></MainLayout>;
  if (!item) return <MainLayout><div>Not found</div></MainLayout>;

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Edit Class</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input value={item.name || ''} onChange={e => setItem({ ...item, name: e.target.value })} placeholder="Name" />
        <input value={item.instructor || ''} onChange={e => setItem({ ...item, instructor: e.target.value })} placeholder="Instructor" />
        <ScheduleBuilder
          schedule={Array.isArray(item.schedule) ? item.schedule : []}
          onChange={(v) => setItem({ ...item, schedule: v })}
          sessionLength={item.sessionLength || 90}
          onSessionLengthChange={(val) => setItem({ ...item, sessionLength: val })}
          roomId={item.roomId}
        />
        <select value={item.roomId || ''} onChange={e => setItem({ ...item, roomId: e.target.value })}>
          <option value="">Assign Room (optional)</option>
          {rooms.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
        </select>
        <input type="number" min="1" value={item.sessionLength || 90} onChange={e => setItem({ ...item, sessionLength: Number(e.target.value) })} placeholder="Session Length (minutes)" />
        <input type="number" min="0" value={item.fee || 0} onChange={e => setItem({ ...item, fee: Number(e.target.value) })} placeholder="Fee" />
        <button type="submit">Save</button>
      </form>
    </MainLayout>
  );
}
