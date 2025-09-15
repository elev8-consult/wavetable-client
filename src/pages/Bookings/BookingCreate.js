import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/MainLayout';
import { createBooking, checkAvailability } from '../../api/bookings';
import { getClients } from '../../api/clients';
import { getRooms } from '../../api/rooms';
import { getClasses } from '../../api/classes';
import { useNavigate } from 'react-router-dom';

export default function BookingCreate() {
  const [clientId, setClientId] = useState('');
  const [serviceType, setServiceType] = useState('room');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [clients, setClients] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState('');
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [sessionOptions, setSessionOptions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [availability, setAvailability] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getClients().then(r => setClients(r.data || []));
    getRooms().then(r => setRooms(r.data || []));
    getClasses().then(r => setClasses(r.data || []));
  }, []);

  // When class changes, provide session options and default start/end
  useEffect(() => {
    if (serviceType !== 'class') return;
    const cls = classes.find(c => c._id === classId);
    if (!cls) {
      setSessionOptions([]);
      setSelectedSession('');
      return;
    }
    const sessions = Array.isArray(cls.schedule) ? cls.schedule : [];
    setSessionOptions(sessions);
    if (sessions.length) {
      const first = sessions[0];
      setSelectedSession(first);
      const len = cls.sessionLength || 90;
      const start = new Date(first);
      const end = new Date(start.getTime() + len * 60000);
      setStartDate(start.toISOString().slice(0,16));
      setEndDate(end.toISOString().slice(0,16));
    }
  }, [serviceType, classId, classes]);

  // Availability check for room bookings
  useEffect(() => {
    if (serviceType !== 'room' || !roomId || !startDate || !endDate) {
      setAvailability(null);
      return;
    }
    const run = async () => {
      try {
        const res = await checkAvailability({ serviceType: 'room', roomId, startDate, endDate });
        setAvailability(res.data);
      } catch (e) {
        setAvailability({ available: false, error: 'Failed to check availability' });
      }
    };
    run();
  }, [serviceType, roomId, startDate, endDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { clientId, serviceType, startDate, endDate };
    if (serviceType === 'room') {
      payload.roomId = roomId;
    } else if (serviceType === 'class') {
      payload.classId = classId;
    }
    await createBooking(payload);
    navigate('/bookings');
  };

  return (
    <MainLayout>
      <div className="page-header">
        <h2 className="page-title">Create Booking</h2>
      </div>
      <form onSubmit={handleSubmit} className="form">
        <select className="form-select" value={clientId} onChange={e => setClientId(e.target.value)}>
          <option value="">Select client</option>
          {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select className="form-select" value={serviceType} onChange={e => setServiceType(e.target.value)}>
          <option value="room">Room</option>
          <option value="equipment">Equipment</option>
          <option value="class">Class</option>
        </select>
        {serviceType === 'room' && (
          <select className="form-select" value={roomId} onChange={e => setRoomId(e.target.value)}>
            <option value="">Select room</option>
            {rooms.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>
        )}
        {serviceType === 'class' && (
          <>
            <select className="form-select" value={classId} onChange={e => setClassId(e.target.value)}>
              <option value="">Select class</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {classId && (
              <select className="form-select" value={selectedSession} onChange={e => {
                const val = e.target.value; setSelectedSession(val);
                const cls = classes.find(c => c._id === classId);
                const len = cls?.sessionLength || 90;
                const start = new Date(val);
                const end = new Date(start.getTime() + len * 60000);
                setStartDate(start.toISOString().slice(0,16));
                setEndDate(end.toISOString().slice(0,16));
              }}>
                {sessionOptions.length === 0 && <option>No sessions</option>}
                {sessionOptions.map((s, idx) => (
                  <option key={idx} value={s}>{new Date(s).toLocaleString()}</option>
                ))}
              </select>
            )}
            {!!classId && (
              <div style={{ fontSize: 12, color: '#aaa' }}>
                Assigned room: {(() => { const cls = classes.find(c => c._id === classId); return cls?.roomId?.name || cls?.roomId || 'Not assigned'; })()}
              </div>
            )}
          </>
        )}
        <input className="form-input" type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input className="form-input" type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} />
        {serviceType === 'room' && availability && (
          <div style={{ color: availability.available ? '#39ff14' : '#ff3b3b' }}>
            {availability.available ? 'Available' : 'Not available'}
          </div>
        )}
        <div className="form-actions">
          <button className="btn btn-primary" type="submit">Create</button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/bookings')}>Cancel</button>
        </div>
      </form>
    </MainLayout>
  );
}
