import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { getBookingById, updateBooking } from '../../api/bookings';
import { getPayments } from '../../api/payments';
import { createPayment } from '../../api/payments';
import { findServiceByCode } from '../../constants/services';
import { useParams } from 'react-router-dom';

const PAYMENT_STATUS_OPTIONS = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
];

export default function BookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [paid, setPaid] = useState(0);
  const [paymentStatusEdit, setPaymentStatusEdit] = useState('unpaid');
  const [statusError, setStatusError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    getBookingById(id).then(async res => {
      setBooking(res.data);
      setPaymentStatusEdit(res.data?.paymentStatus || 'unpaid');
      try {
        const p = await getPayments({ bookingId: id });
        const total = (p.data || []).filter(x => x.type === 'income').reduce((s, x) => s + (Number(x.amount) || 0), 0);
        setPaid(total);
      } catch {}
    });
  }, [id]);

  if (!booking) return <MainLayout><div>Loading...</div></MainLayout>;

  const serviceDef = findServiceByCode(booking.serviceCode);
  const fullPrice = typeof booking.fullPrice === 'number' ? booking.fullPrice : (typeof booking.totalFee === 'number' ? booking.totalFee : 0);
  const discountedPrice = typeof booking.discountedPrice === 'number' ? booking.discountedPrice : null;
  const finalPrice = discountedPrice !== null ? discountedPrice : fullPrice;
  const priceCurrency = booking.priceCurrency || 'USD';
  const remaining = Math.max(finalPrice - paid, 0);

  const handlePaymentStatusUpdate = async () => {
    if (!booking) return;
    setStatusError('');
    try {
      setStatusUpdating(true);
      const res = await updateBooking(booking._id, { paymentStatus: paymentStatusEdit });
      setBooking(res.data);
      setPaymentStatusEdit(res.data?.paymentStatus || paymentStatusEdit);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to update payment status';
      setStatusError(message);
    } finally {
      setStatusUpdating(false);
    }
  };

  const bookingStatus = booking.paymentStatus || 'unpaid';
  const statusChanged = paymentStatusEdit !== bookingStatus;

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Booking</h2>
      <div>Client: {booking.clientId?.name || booking.clientId || '-'}</div>
      <div>Type: {booking.serviceType}</div>
      <div>Service: {serviceDef ? serviceDef.name : (booking.serviceCode || '-')}</div>
      <div>Start: {booking.startDate ? new Date(booking.startDate).toLocaleString() : '-'}</div>
      <div>End: {booking.endDate ? new Date(booking.endDate).toLocaleString() : '-'}</div>
      <div>Payment Status: {bookingStatus}</div>
      <div style={{ marginTop: 8, padding: 10, border: '1px solid #333', borderRadius: 8 }}>
        <div>Full Price: {fullPrice} {priceCurrency}</div>
        <div>Discounted Price: {discountedPrice !== null ? `${discountedPrice} ${priceCurrency}` : '—'}</div>
        <div>Paid: {paid} {priceCurrency}</div>
        <div>Remaining: {remaining} {priceCurrency}</div>
      </div>
      <div style={{ marginTop: 12 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 4 }}>Update Payment Status</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={paymentStatusEdit} onChange={e => setPaymentStatusEdit(e.target.value)}>
            {PAYMENT_STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handlePaymentStatusUpdate}
            className="btn btn-primary"
            disabled={!statusChanged || statusUpdating}
          >
            {statusUpdating ? 'Updating...' : 'Update Status'}
          </button>
        </div>
        {statusError && <div style={{ color: 'red', marginTop: 4 }}>{statusError}</div>}
      </div>
      <h3 style={{ marginTop: 16 }}>Collect Payment</h3>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={async (e) => {
        e.preventDefault();
        setError('');
        try {
          await createPayment({
            clientId: booking.clientId?._id || booking.clientId,
            bookingId: booking._id,
            type: 'income',
            amount: Number(amount),
            method,
            description
          });
          const res = await getBookingById(id);
          setBooking(res.data);
          setPaymentStatusEdit(res.data?.paymentStatus || 'unpaid');
          const p = await getPayments({ bookingId: id });
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
