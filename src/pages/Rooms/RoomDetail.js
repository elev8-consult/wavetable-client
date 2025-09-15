import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { getRoomById } from '../../api/rooms';
import { useParams } from 'react-router-dom';

export default function RoomDetail() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);

  useEffect(() => {
    getRoomById(id).then(res => setRoom(res.data));
  }, [id]);

  if (!room) return <MainLayout><div>Loading...</div></MainLayout>;

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>{room.name}</h2>
      <div>Capacity: {room.capacity}</div>
    </MainLayout>
  );
}
