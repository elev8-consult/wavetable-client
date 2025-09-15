import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/MainLayout';
import { createEnrollment } from '../../api/enrollments';
import { getClients } from '../../api/clients';
import { getClasses } from '../../api/classes';
import { useNavigate } from 'react-router-dom';

export default function EnrollmentCreate() {
  const [studentId, setStudentId] = useState('');
  const [classId, setClassId] = useState('');
  const [clients, setClients] = useState([]);
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getClients().then(r => setClients(r.data || []));
    getClasses().then(r => setClasses(r.data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createEnrollment({ studentId, classId });
    navigate('/enrollments');
  };

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Add Enrollment</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <select value={studentId} onChange={e => setStudentId(e.target.value)}>
          <option value="">Select client</option>
          {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={classId} onChange={e => setClassId(e.target.value)}>
          <option value="">Select class</option>
          {classes.map(cl => <option key={cl._id} value={cl._id}>{cl.name}</option>)}
        </select>
        <button type="submit">Create</button>
      </form>
    </MainLayout>
  );
}
