import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { getEnrollmentById, updateEnrollment } from '../../api/enrollments';
import { useParams, useNavigate } from 'react-router-dom';

export default function EnrollmentEdit() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getEnrollmentById(id).then(res => setItem(res.data)).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateEnrollment(id, item);
    navigate('/enrollments');
  };

  if (loading) return <MainLayout><div>Loading...</div></MainLayout>;
  if (!item) return <MainLayout><div>Not found</div></MainLayout>;

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Edit Enrollment</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <select value={item.paymentStatus || 'unpaid'} onChange={e => setItem({ ...item, paymentStatus: e.target.value })}>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
        <textarea placeholder="Feedback" value={item.feedback || ''} onChange={e => setItem({ ...item, feedback: e.target.value })} />
        <button type="submit">Save</button>
      </form>
    </MainLayout>
  );
}
