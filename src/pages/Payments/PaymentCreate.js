import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { createPayment } from '../../api/payments';
import { getClients } from '../../api/clients';
import { getBookings } from '../../api/bookings';
import { SERVICE_CATALOG, findServiceByCode, getServiceCategory } from '../../constants/services';
import { useNavigate } from 'react-router-dom';

const CUSTOM_SERVICE_CODE = '__custom__';
const DEFAULT_CURRENCY = 'USD';

const manualServiceOptions = [
  { value: 'room', label: 'Room / Studio' },
  { value: 'equipment', label: 'Equipment Rental' },
  { value: 'class', label: 'Class / Program' },
  { value: 'service', label: 'Other Service' },
];

export default function PaymentCreate() {
  const [clients, setClients] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [clientId, setClientId] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [serviceCode, setServiceCode] = useState(CUSTOM_SERVICE_CODE);
  const [manualServiceType, setManualServiceType] = useState('service');
  const [type, setType] = useState('income');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [description, setDescription] = useState('');
  const [priceCurrency, setPriceCurrency] = useState(DEFAULT_CURRENCY);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const serviceDef = useMemo(() => {
    if (serviceCode === CUSTOM_SERVICE_CODE) return null;
    return findServiceByCode(serviceCode);
  }, [serviceCode]);
  const serviceType = serviceDef?.category || manualServiceType;

  useEffect(() => {
    getClients().then(r => setClients(r.data || [])).catch(() => setClients([]));
    getBookings().then(r => setBookings(r.data || [])).catch(() => setBookings([]));
  }, []);

  const handleBookingChange = (id) => {
    setBookingId(id);
    if (!id) return;
    const booking = bookings.find(b => b._id === id);
    if (!booking) return;
    setClientId(booking.clientId?._id || booking.clientId || '');
    if (booking.serviceCode && findServiceByCode(booking.serviceCode)) {
      setServiceCode(booking.serviceCode);
      setManualServiceType(booking.serviceType || getServiceCategory(booking.serviceCode) || 'service');
    } else {
      setServiceCode(CUSTOM_SERVICE_CODE);
      setManualServiceType(booking.serviceType || 'service');
    }
    setPriceCurrency((booking.priceCurrency || DEFAULT_CURRENCY).toUpperCase());
  };

  const handleServiceChange = (code) => {
    setServiceCode(code);
    if (code === CUSTOM_SERVICE_CODE) {
      setManualServiceType('service');
    } else {
      const derived = getServiceCategory(code);
      if (derived) setManualServiceType(derived);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numericAmount = Number(amount);
    if (amount === '' || Number.isNaN(numericAmount)) {
      setError('Amount must be provided as a number.');
      return;
    }
    if (!clientId) {
      setError('Select a client for the payment.');
      return;
    }
    if (!serviceType) {
      setError('Select the service type.');
      return;
    }

    const payload = {
      clientId,
      bookingId: bookingId || undefined,
      type,
      amount: numericAmount,
      method,
      description,
      date,
      serviceCode: serviceDef?.code || undefined,
      serviceType,
      priceCurrency: priceCurrency ? priceCurrency.trim().toUpperCase() : DEFAULT_CURRENCY,
    };

    try {
      await createPayment(payload);
      navigate('/payments');
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to create payment.';
      setError(message);
    }
  };

  const bookingLabel = (booking) => {
    const name = booking.clientId?.name || booking.clientId || 'Unknown client';
    const def = findServiceByCode(booking.serviceCode);
    const serviceName = def ? def.name : booking.serviceType || 'Service';
    const start = booking.startDate ? new Date(booking.startDate).toLocaleString() : 'No start';
    return `${name} — ${serviceName} (${start})`;
  };

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Create Payment</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 520 }}>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <select value={clientId} onChange={e => setClientId(e.target.value)}>
          <option value="">Select client</option>
          {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        <select value={bookingId} onChange={e => handleBookingChange(e.target.value)}>
          <option value="">Link to booking (optional)</option>
          {bookings.map(b => <option key={b._id} value={b._id}>{bookingLabel(b)}</option>)}
        </select>

        <select value={serviceCode} onChange={e => handleServiceChange(e.target.value)}>
          <option value={CUSTOM_SERVICE_CODE}>Manual service selection</option>
          {SERVICE_CATALOG.map(service => (
            <option key={service.code} value={service.code}>{service.name}</option>
          ))}
        </select>
        {serviceDef && <div style={{ fontSize: 12, color: '#888' }}>{serviceDef.description}</div>}

        {serviceCode === CUSTOM_SERVICE_CODE && (
          <select value={manualServiceType} onChange={e => setManualServiceType(e.target.value)}>
            {manualServiceOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <select value={type} onChange={e => setType(e.target.value)} style={{ maxWidth: 140 }}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Amount"
            type="number"
            step="0.01"
            min="0"
            style={{ maxWidth: 160 }}
          />
          <input
            value={priceCurrency}
            onChange={e => setPriceCurrency(e.target.value)}
            placeholder="Currency"
            style={{ maxWidth: 120 }}
          />
        </div>

        <input type="date" value={date} onChange={e => setDate(e.target.value)} />

        <input value={method} onChange={e => setMethod(e.target.value)} placeholder="Method (cash/card/etc)" />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" rows={3} />

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary">Create</button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/payments')}>Cancel</button>
        </div>
      </form>
    </MainLayout>
  );
}
