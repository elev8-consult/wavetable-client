import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { getClassById } from '../../api/classes';
import { useParams } from 'react-router-dom';

export default function ClassDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    getClassById(id).then(res => setItem(res.data));
  }, [id]);

  if (!item) return <MainLayout><div>Loading...</div></MainLayout>;

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>{item.name}</h2>
      <div>Instructor: {item.instructor}</div>
      <div>Room: {item.roomId?.name || item.roomId || '-'}</div>
      <div>Session Length: {item.sessionLength || 60} min</div>
      <div>Fee: {item.fee || 0}</div>
      <div>Schedule:</div>
      <ul>
        {(item.schedule || []).map((d, idx) => (
          <li key={idx}>{new Date(d).toLocaleString()}</li>
        ))}
      </ul>
    </MainLayout>
  );
}
