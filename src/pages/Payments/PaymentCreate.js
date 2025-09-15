import React, { useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { createPayment } from '../../api/payments';
import { useNavigate } from 'react-router-dom';

export default function PaymentCreate() {
  const [clientId, setClientId] = useState('');
  const [type, setType] = useState('income');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createPayment({ clientId, amount: Number(amount), date, type, method, description });
    navigate('/payments');
  };

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Create Payment</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input value={clientId} onChange={e => setClientId(e.target.value)} placeholder="Client ID" />
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" />
        <input value={method} onChange={e => setMethod(e.target.value)} placeholder="Method (cash/card/etc)" />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <button type="submit">Create</button>
      </form>
    </MainLayout>
  );
}
