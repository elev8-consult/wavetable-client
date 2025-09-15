import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { getRoomById, updateRoom } from '../../api/rooms';
import { useParams, useNavigate } from 'react-router-dom';

export default function RoomEdit() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getRoomById(id).then(res => setRoom(res.data)).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateRoom(id, room);
    navigate('/rooms');
  };

  if (loading) return <MainLayout><div>Loading...</div></MainLayout>;
  if (!room) return <MainLayout><div>Not found</div></MainLayout>;

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Edit Room</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input value={room.name || ''} onChange={e => setRoom({ ...room, name: e.target.value })} placeholder="Name" />
        <input type="number" value={room.capacity || 1} onChange={e => setRoom({ ...room, capacity: Number(e.target.value) })} placeholder="Capacity" />
        <button type="submit">Save</button>
      </form>
    </MainLayout>
  );
}
