import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { createClass } from '../../api/classes';
import { getRooms } from '../../api/rooms';
import ScheduleBuilder from '../../components/ScheduleBuilder';
import { useNavigate } from 'react-router-dom';

export default function ClassCreate() {
  const [name, setName] = useState('');
  const [instructor, setInstructor] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [roomId, setRoomId] = useState('');
  const [sessionLength, setSessionLength] = useState(90);
  const [fee, setFee] = useState('');
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getRooms().then(r => setRooms(r.data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createClass({ name, instructor, schedule, roomId: roomId || undefined, sessionLength: Number(sessionLength) || 90, fee: Number(fee) || 0 });
    navigate('/classes');
  };

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Create Class</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
        <input value={instructor} onChange={e => setInstructor(e.target.value)} placeholder="Instructor" />
        <ScheduleBuilder
          schedule={schedule}
          onChange={setSchedule}
          sessionLength={sessionLength}
          onSessionLengthChange={setSessionLength}
          roomId={roomId}
        />
        <select value={roomId} onChange={e => setRoomId(e.target.value)}>
          <option value="">Assign Room (optional)</option>
          {rooms.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
        </select>
        <input type="number" min="1" value={sessionLength} onChange={e => setSessionLength(e.target.value)} placeholder="Session Length (minutes)" />
        <input type="number" min="0" value={fee} onChange={e => setFee(e.target.value)} placeholder="Fee" />
        <button type="submit">Create</button>
      </form>
    </MainLayout>
  );
}
