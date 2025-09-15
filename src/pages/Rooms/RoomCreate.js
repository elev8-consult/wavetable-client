import React, { useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { addRoom } from '../../api/rooms';
import { useNavigate } from 'react-router-dom';

export default function RoomCreate() {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(1);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addRoom({ name, capacity });
    navigate('/rooms');
  };

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Add Room</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
        <input type="number" value={capacity} onChange={e => setCapacity(Number(e.target.value))} placeholder="Capacity" />
        <button type="submit">Create</button>
      </form>
    </MainLayout>
  );
}
