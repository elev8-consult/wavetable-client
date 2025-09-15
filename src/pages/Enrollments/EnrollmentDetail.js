import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { getEnrollmentById } from '../../api/enrollments';
import { createPayment, getPayments } from '../../api/payments';
import { useParams } from 'react-router-dom';

export default function EnrollmentDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [paid, setPaid] = useState(0);

  useEffect(() => {
    getEnrollmentById(id).then(async res => {
      setItem(res.data);
      try {
        const p = await getPayments({ enrollmentId: id });
        const total = (p.data || []).filter(x => x.type === 'income').reduce((s, x) => s + (Number(x.amount) || 0), 0);
        setPaid(total);
      } catch {}
    });
  }, [id]);

  if (!item) return <MainLayout><div>Loading...</div></MainLayout>;

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Enrollment</h2>
      <div>Student: {item.studentId?.name || item.studentId || '-'}</div>
      <div>Class: {item.classId?.name || item.classId || '-'}</div>
      <div>Payment: {item.paymentStatus || '-'}</div>
      <div style={{ marginTop: 8, padding: 10, border: '1px solid #333', borderRadius: 8 }}>
        <div>Class Fee: {item.classId?.fee || 0}</div>
        <div>Paid: {paid}</div>
        <div>Remaining: {Math.max((item.classId?.fee || 0) - paid, 0)}</div>
      </div>
      <h3 style={{ marginTop: 16 }}>Collect Payment</h3>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={async (e) => {
        e.preventDefault();
        setError('');
        try {
          await createPayment({
            clientId: item.studentId?._id || item.studentId,
            enrollmentId: item._id,
            type: 'income',
            amount: Number(amount),
            method,
            description
          });
          const res = await getEnrollmentById(id);
          setItem(res.data);
          const p = await getPayments({ enrollmentId: id });
          const total = (p.data || []).filter(x => x.type === 'income').reduce((s, x) => s + (Number(x.amount) || 0), 0);
          setPaid(total);
          setAmount(''); setMethod(''); setDescription('');
        } catch (err) {
          setError('Failed to collect payment');
        }
      }} style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" style={{ maxWidth: 120 }} />
        <input value={method} onChange={e => setMethod(e.target.value)} placeholder="Method" style={{ maxWidth: 160 }} />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" style={{ flex: 1 }} />
        <button className="btn btn-primary" type="submit">Add Payment</button>
      </form>
    </MainLayout>
  );
}
