import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { createBooking, checkAvailability } from '../../api/bookings';
import { getClients } from '../../api/clients';
import { getRooms } from '../../api/rooms';
import { getClasses } from '../../api/classes';
import { getEquipment } from '../../api/equipment';
import { SERVICE_CATALOG, findServiceByCode, getServiceCategory } from '../../constants/services';
import { useNavigate } from 'react-router-dom';

const CUSTOM_SERVICE_CODE = '__custom__';
const NO_SERVICE_SELECTED = '__select__';
const DEFAULT_CURRENCY = 'USD';

const allowedManualServiceTypes = [
  { value: 'room', label: 'Room / Studio' },
  { value: 'equipment', label: 'Equipment Rental' },
  { value: 'class', label: 'Class / Program' },
  { value: 'service', label: 'Other Service' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
];

export default function BookingCreate() {
  const [clientId, setClientId] = useState('');
  const [serviceCode, setServiceCode] = useState(NO_SERVICE_SELECTED);
  const [manualServiceType, setManualServiceType] = useState('room');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fullPrice, setFullPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [priceCurrency, setPriceCurrency] = useState(DEFAULT_CURRENCY);
  const [priceNotes, setPriceNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [clients, setClients] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState('');
  const [equipment, setEquipment] = useState([]);
  const [equipmentId, setEquipmentId] = useState('');
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [sessionOptions, setSessionOptions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [availability, setAvailability] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const isCustomService = serviceCode === CUSTOM_SERVICE_CODE;
  const serviceDef = useMemo(() => {
    if (serviceCode === CUSTOM_SERVICE_CODE || serviceCode === NO_SERVICE_SELECTED) return null;
    return findServiceByCode(serviceCode);
  }, [serviceCode]);
  const serviceType = serviceDef?.category || manualServiceType;
  const requiresClassId = serviceType === 'class' && (serviceDef ? serviceDef.requiresClassId !== false : true);

  useEffect(() => {
    getClients().then(r => setClients(r.data || [])).catch(() => setClients([]));
    getRooms().then(r => setRooms(r.data || [])).catch(() => setRooms([]));
    getClasses().then(r => setClasses(r.data || [])).catch(() => setClasses([]));
    getEquipment().then(r => setEquipment(r.data || [])).catch(() => setEquipment([]));
  }, []);

  useEffect(() => {
    if (!serviceDef) return;
    const defaultPrice = serviceDef.defaults?.fullPrice;
    if (defaultPrice !== undefined && fullPrice === '') {
      setFullPrice(String(defaultPrice));
    }
    if (serviceDef.defaults?.durationMinutes && startDate) {
      const start = new Date(startDate);
      if (!Number.isNaN(start.getTime())) {
        const endIso = new Date(start.getTime() + serviceDef.defaults.durationMinutes * 60000).toISOString().slice(0, 16);
        setEndDate(prev => prev || endIso);
      }
    }
  }, [serviceDef, startDate, fullPrice]);

  useEffect(() => {
    if (serviceType !== 'class') {
      setClassId('');
      setSessionOptions([]);
      setSelectedSession('');
    }
    if (serviceType !== 'room') {
      setRoomId('');
      setAvailability(null);
    }
    if (serviceType !== 'equipment') {
      setEquipmentId('');
    }
  }, [serviceType]);

  useEffect(() => {
    if (serviceType !== 'class' || !classId) {
      setSessionOptions([]);
      setSelectedSession('');
      return;
    }
    const cls = classes.find(c => c._id === classId);
    if (!cls) {
      setSessionOptions([]);
      setSelectedSession('');
      return;
    }
    const sessions = Array.isArray(cls.schedule) ? cls.schedule : [];
    setSessionOptions(sessions);
    if (sessions.length) {
      const first = sessions[0];
      setSelectedSession(first);
      const len = cls.sessionLength || serviceDef?.defaults?.durationMinutes || 90;
      const start = new Date(first);
      const end = new Date(start.getTime() + len * 60000);
      setStartDate(start.toISOString().slice(0, 16));
      setEndDate(end.toISOString().slice(0, 16));
    }
  }, [serviceType, classId, classes, serviceDef]);

  useEffect(() => {
    if (serviceType === 'class' && selectedSession) {
      const cls = classes.find(c => c._id === classId);
      const len = cls?.sessionLength || serviceDef?.defaults?.durationMinutes || 90;
      const start = new Date(selectedSession);
      if (!Number.isNaN(start.getTime())) {
        setStartDate(start.toISOString().slice(0, 16));
        const end = new Date(start.getTime() + len * 60000);
        setEndDate(end.toISOString().slice(0, 16));
      }
    }
  }, [selectedSession, serviceType, classes, classId, serviceDef]);

  useEffect(() => {
    if (serviceType !== 'room' || !roomId || !startDate || !endDate) {
      setAvailability(null);
      return;
    }
    let cancelled = false;
    const run = async () => {
      try {
        const res = await checkAvailability({ serviceType: 'room', roomId, startDate, endDate });
        if (!cancelled) setAvailability(res.data);
      } catch (e) {
        if (!cancelled) setAvailability({ available: false, error: 'Failed to check availability' });
      }
    };
    run();
    return () => { cancelled = true; };
  }, [serviceType, roomId, startDate, endDate]);

  const handleServiceChange = (value) => {
    setServiceCode(value);
    setStartDate('');
    setEndDate('');
    setAvailability(null);
    if (value === CUSTOM_SERVICE_CODE) {
      setManualServiceType('room');
      setFullPrice('');
      setDiscountedPrice('');
    } else if (value !== NO_SERVICE_SELECTED) {
      const def = findServiceByCode(value);
      const derived = getServiceCategory(value);
      if (derived) setManualServiceType(derived);
      if (def?.defaults?.fullPrice !== undefined) {
        setFullPrice(String(def.defaults.fullPrice));
      } else {
        setFullPrice('');
      }
      setDiscountedPrice('');
    } else {
      setFullPrice('');
      setDiscountedPrice('');
    }
    setPriceNotes('');
    setSelectedSession('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!clientId) {
      setError('Please select a client.');
      return;
    }

    if (serviceCode === NO_SERVICE_SELECTED && !isCustomService) {
      setError('Please select a service.');
      return;
    }

    const numericFullPrice = Number(fullPrice);
    if (fullPrice === '' || Number.isNaN(numericFullPrice)) {
      setError('Full price must be provided as a number.');
      return;
    }

    const numericDiscount = discountedPrice === '' ? undefined : Number(discountedPrice);
    if (discountedPrice !== '' && Number.isNaN(numericDiscount)) {
      setError('Discounted price must be a valid number.');
      return;
    }
    if (numericDiscount !== undefined && numericDiscount > numericFullPrice) {
      setError('Discounted price cannot exceed full price.');
      return;
    }

    if (serviceType === 'room') {
      if (!roomId) {
        setError('Please choose a room.');
        return;
      }
      if (!startDate || !endDate) {
        setError('Provide start and end time for the room booking.');
        return;
      }
    }

    if (serviceType === 'equipment') {
      if (!equipmentId) {
        setError('Please choose the equipment to rent.');
        return;
      }
      if (!startDate || !endDate) {
        setError('Provide start and end time for the equipment booking.');
        return;
      }
    }

    if (serviceType === 'class' && requiresClassId && !classId) {
      setError('Please choose the class.');
      return;
    }

    if (serviceType === 'service') {
      if (!startDate || !endDate) {
        setError('Provide start and end time for the service.');
        return;
      }
    }

    const currency = priceCurrency ? priceCurrency.trim().toUpperCase() : DEFAULT_CURRENCY;
    const payload = {
      clientId,
      serviceType,
      serviceCode: serviceDef?.code || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      roomId: serviceType === 'room' ? roomId : undefined,
      equipmentId: serviceType === 'equipment' ? equipmentId : undefined,
      classId: serviceType === 'class' ? classId || undefined : undefined,
      fullPrice: numericFullPrice,
      discountedPrice: numericDiscount,
      priceCurrency: currency,
      priceNotes: priceNotes ? priceNotes.trim() : undefined,
      paymentStatus,
    };

    try {
      await createBooking(payload);
      navigate('/bookings');
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to create booking.';
      setError(message);
    }
  };

  const selectedServiceValue = serviceCode;

  return (
    <MainLayout>
      <div className="page-header">
        <h2 className="page-title">Create Booking</h2>
      </div>
      <form onSubmit={handleSubmit} className="form">
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <select className="form-select" value={clientId} onChange={e => setClientId(e.target.value)}>
          <option value="">Select client</option>
          {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        <select className="form-select" value={selectedServiceValue} onChange={e => handleServiceChange(e.target.value)}>
          <option value={NO_SERVICE_SELECTED}>Select service</option>
          {SERVICE_CATALOG.map(service => (
            <option key={service.code} value={service.code}>{service.name}</option>
          ))}
          <option value={CUSTOM_SERVICE_CODE}>Manual setup</option>
        </select>
        {serviceDef && <div style={{ fontSize: 12, color: '#888' }}>{serviceDef.description}</div>}

        {isCustomService && (
          <select className="form-select" value={manualServiceType} onChange={e => setManualServiceType(e.target.value)}>
            {allowedManualServiceTypes.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}

        {serviceType === 'room' && (
          <select className="form-select" value={roomId} onChange={e => setRoomId(e.target.value)}>
            <option value="">Select room</option>
            {rooms.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>
        )}

        {serviceType === 'equipment' && (
          <select className="form-select" value={equipmentId} onChange={e => setEquipmentId(e.target.value)}>
            <option value="">Select equipment</option>
            {equipment.map(eq => <option key={eq._id} value={eq._id}>{eq.name}</option>)}
          </select>
        )}

        {serviceType === 'class' && requiresClassId && (
          <select className="form-select" value={classId} onChange={e => setClassId(e.target.value)}>
            <option value="">Select class</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        )}

        {serviceType === 'class' && sessionOptions.length > 0 && (
          <select className="form-select" value={selectedSession} onChange={e => setSelectedSession(e.target.value)}>
            {sessionOptions.map((s, idx) => (
              <option key={idx} value={s}>{new Date(s).toLocaleString()}</option>
            ))}
          </select>
        )}

        {(serviceType === 'room' || serviceType === 'equipment' || serviceType === 'service' || (serviceType === 'class' && !requiresClassId)) && (
          <>
            <input className="form-input" type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <input className="form-input" type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </>
        )}

        {serviceType === 'room' && availability && (
          <div style={{ color: availability.available ? '#39ff14' : '#ff3b3b' }}>
            {availability.available ? 'Room is available' : 'Room is not available'}
          </div>
        )}

        <div className="form-grid">
          <input
            className="form-input"
            type="number"
            min="0"
            step="0.01"
            value={fullPrice}
            onChange={e => setFullPrice(e.target.value)}
            placeholder="Full price"
          />
          <input
            className="form-input"
            type="number"
            min="0"
            step="0.01"
            value={discountedPrice}
            onChange={e => setDiscountedPrice(e.target.value)}
            placeholder="Discounted price (optional)"
          />
          <input
            className="form-input"
            value={priceCurrency}
            onChange={e => setPriceCurrency(e.target.value)}
            placeholder="Currency"
            style={{ maxWidth: 120 }}
          />
        </div>

        <select className="form-select" value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
          {PAYMENT_STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <textarea
          className="form-textarea"
          value={priceNotes}
          onChange={e => setPriceNotes(e.target.value)}
          placeholder="Notes about pricing (optional)"
          rows={3}
        />

        <div className="form-actions">
          <button className="btn btn-primary" type="submit">Create</button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/bookings')}>Cancel</button>
        </div>
      </form>
    </MainLayout>
  );
}
