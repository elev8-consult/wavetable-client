import React, { useEffect, useMemo, useState } from 'react';
import { getClientById } from '../../api/clients';
import { getBookings } from '../../api/bookings';
import { getPayments } from '../../api/payments';
import MainLayout from '../../components/MainLayout';
import { useParams, Link } from 'react-router-dom';
import { findServiceByCode } from '../../constants/services';

export default function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [clientRes, bookingsRes, paymentsRes] = await Promise.all([
          getClientById(id),
          getBookings({ clientId: id }),
          getPayments({ clientId: id, type: 'income' })
        ]);
        setClient(clientRes.data);
        setBookings(bookingsRes.data || []);
        setPayments(paymentsRes.data || []);
      } catch (e) {
        setError('Failed to load client data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const paymentsByBooking = useMemo(() => {
    const map = {};
    (payments || []).forEach(p => {
      const bookingId = p.bookingId?._id || p.bookingId;
      if (!bookingId) return;
      const amount = Number(p.amount) || 0;
      map[bookingId] = (map[bookingId] || 0) + amount;
    });
    return map;
  }, [payments]);

  if (loading) return <MainLayout><div>Loading...</div></MainLayout>;
  if (error) return <MainLayout><div style={{ color: 'red' }}>{error}</div></MainLayout>;
  if (!client) return <MainLayout><div>Client not found</div></MainLayout>;

  return (
    <MainLayout>
      <div className="page-header">
        <h2 className="page-title">{client.name}</h2>
        <div>
          <Link to={`/clients/${client._id}/edit`} className="btn btn-ghost">Edit</Link>
        </div>
      </div>
      <div>Type: <b>{client.type}</b></div>
      <div>Email: {client.email}</div>
      <div>Phone: {client.phone}</div>
      <div>Age: {client.age}</div>
      <div>Company Name: {client.companyName}</div>
      <div>Contact Person: {client.contactPerson}</div>
      <div>Notes: {client.notes}</div>

      <h3 style={{ marginTop: 24 }}>Booked Services</h3>
      {bookings.length === 0 ? (
        <div>No services booked yet.</div>
      ) : (
        <table style={{ width: '100%', marginTop: 8, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}>
              <th style={{ padding: '8px 4px' }}>Service</th>
              <th style={{ padding: '8px 4px' }}>Dates</th>
              <th style={{ padding: '8px 4px' }}>Price</th>
              <th style={{ padding: '8px 4px' }}>Paid</th>
              <th style={{ padding: '8px 4px' }}>Remaining</th>
              <th style={{ padding: '8px 4px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => {
              const serviceDef = findServiceByCode(booking.serviceCode);
              const fullPrice = typeof booking.fullPrice === 'number' ? booking.fullPrice : (typeof booking.totalFee === 'number' ? booking.totalFee : 0);
              const discounted = typeof booking.discountedPrice === 'number' ? booking.discountedPrice : null;
              const finalPrice = discounted !== null ? discounted : fullPrice;
              const currency = booking.priceCurrency || 'USD';
              const paidAmount = paymentsByBooking[booking._id] || 0;
              const remaining = Math.max(finalPrice - paidAmount, 0);
              return (
                <tr key={booking._id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '8px 4px' }}>{serviceDef ? serviceDef.name : booking.serviceType}</td>
                  <td style={{ padding: '8px 4px', fontSize: 12 }}>
                    {booking.startDate ? new Date(booking.startDate).toLocaleString() : '-'}
                    {booking.endDate ? ` → ${new Date(booking.endDate).toLocaleString()}` : ''}
                  </td>
                  <td style={{ padding: '8px 4px' }}>
                    {finalPrice} {currency}
                    {discounted !== null && discounted !== finalPrice ? ` (discount from ${fullPrice})` : ''}
                  </td>
                  <td style={{ padding: '8px 4px' }}>{paidAmount} {currency}</td>
                  <td style={{ padding: '8px 4px' }}>{remaining} {currency}</td>
                  <td style={{ padding: '8px 4px' }}>{booking.paymentStatus || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </MainLayout>
  );
}
