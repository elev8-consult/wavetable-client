import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { getAttendanceById } from '../../api/attendance';
import { useParams } from 'react-router-dom';

export default function AttendanceDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    getAttendanceById(id).then(res => setItem(res.data));
  }, [id]);

  if (!item) return <MainLayout><div>Loading...</div></MainLayout>;

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Attendance</h2>
      <div>Student: {item.studentId?.name || item.studentId || '-'}</div>
      <div>Class: {item.classId?.name || item.classId || '-'}</div>
      <div>Date: {item.sessionDate ? new Date(item.sessionDate).toLocaleString() : '-'}</div>
    </MainLayout>
  );
}
