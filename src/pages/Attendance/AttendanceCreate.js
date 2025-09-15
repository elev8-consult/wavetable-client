import React, { useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { createAttendance } from '../../api/attendance';
import { useNavigate } from 'react-router-dom';

export default function AttendanceCreate() {
  const [studentId, setStudentId] = useState('');
  const [classId, setClassId] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createAttendance({ studentId, classId, sessionDate });
    navigate('/attendance');
  };

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Add Attendance</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="Student (Client) ID" />
        <input value={classId} onChange={e => setClassId(e.target.value)} placeholder="Class ID (optional)" />
        <input type="datetime-local" value={sessionDate} onChange={e => setSessionDate(e.target.value)} />
        <button type="submit">Create</button>
      </form>
    </MainLayout>
  );
}
