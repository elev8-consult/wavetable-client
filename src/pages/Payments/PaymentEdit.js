import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { getPaymentById, updatePayment } from '../../api/payments';
import { useParams, useNavigate } from 'react-router-dom';

export default function PaymentEdit() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getPaymentById(id).then(res => setItem(res.data)).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updatePayment(id, item);
    navigate('/payments');
  };

  if (loading) return <MainLayout><div>Loading...</div></MainLayout>;
  if (!item) return <MainLayout><div>Not found</div></MainLayout>;

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Edit Payment</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <select value={item.type || 'income'} onChange={e => setItem({ ...item, type: e.target.value })}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input value={item.amount || ''} onChange={e => setItem({ ...item, amount: e.target.value })} placeholder="Amount" />
        <input value={item.method || ''} onChange={e => setItem({ ...item, method: e.target.value })} placeholder="Method" />
        <input value={item.description || ''} onChange={e => setItem({ ...item, description: e.target.value })} placeholder="Description" />
        <input type="date" value={item.date ? item.date.split('T')[0] : ''} onChange={e => setItem({ ...item, date: e.target.value })} />
        <button type="submit">Save</button>
      </form>
    </MainLayout>
  );
}
