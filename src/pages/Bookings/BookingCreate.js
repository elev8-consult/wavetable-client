import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { createBooking, checkAvailability } from '../../api/bookings';
import { getClients } from '../../api/clients';
import { getRooms } from '../../api/rooms';
import { getEquipment } from '../../api/equipment';
import { SERVICE_CATALOG, findServiceByCode, getServiceCategory } from '../../constants/services';
import { useNavigate } from 'react-router-dom';
import './BookingForm.css';

const CUSTOM_SERVICE_CODE = '__custom__';
const NO_SERVICE_SELECTED = '__select__';
const DEFAULT_CURRENCY = 'USD';
const DAYS_PER_WEEK = 7;
const WEEKS_TO_SHOW = 4;
const DAY_COUNT = DAYS_PER_WEEK * WEEKS_TO_SHOW;

const TIME_OPTIONS = (() => {
  const slots = [];
  for (let hour = 12; hour <= 23; hour += 1) {
    ['00', '30'].forEach(min => {
      slots.push(`${String(hour).padStart(2, '0')}:${min}`);
    });
  }
  return slots;
})();

const MANUAL_TYPES = [
  { value: 'room', label: 'Room / Studio' },
  { value: 'equipment', label: 'Equipment Rental' },
  { value: 'service', label: 'Service' },
  { value: 'class', label: 'Program / Class' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
];

const SERVICE_DURATIONS = {
  room: 60,
  equipment: 60,
  service: 60,
  class: 90,
  private_dj_class: 90,
  dj_class_level1: 90,
  dj_class_level2: 90,
  video_recording: 60,
  production_consulting: 60,
};

function getServiceDurationMinutes(serviceType, def) {
  if (def?.defaults?.durationMinutes) return def.defaults.durationMinutes;
  if (def?.code && SERVICE_DURATIONS[def.code]) return SERVICE_DURATIONS[def.code];
  if (SERVICE_DURATIONS[serviceType]) return SERVICE_DURATIONS[serviceType];
  return 60;
}

function formatDateTimeLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function addDays(base, amount) {
  const copy = new Date(base);
  copy.setDate(copy.getDate() + amount);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function isPastSlot(day, time) {
  const [hours, minutes] = time.split(':').map(Number);
  const slot = new Date(day);
  slot.setHours(hours, minutes, 0, 0);
  return slot.getTime() <= Date.now();
}

function createSlot(day, time, durationMinutes) {
  const [hours, minutes] = time.split(':').map(Number);
  const start = new Date(day);
  start.setHours(hours, minutes, 0, 0);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  return { start, end };
}

function formatDurationText(minutes) {
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const parts = [];
  if (hours) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  if (mins) parts.push(`${mins} min`);
  return parts.join(' ');
}

export default function BookingCreate() {
  const [clientId, setClientId] = useState('');
  const [serviceCode, setServiceCode] = useState(NO_SERVICE_SELECTED);
  const [manualServiceType, setManualServiceType] = useState('room');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [weekPage, setWeekPage] = useState(0);
  const [selectedTime, setSelectedTime] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [roomId, setRoomId] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [fullPrice, setFullPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [priceCurrency, setPriceCurrency] = useState(DEFAULT_CURRENCY);
  const [notes, setNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [availability, setAvailability] = useState(null);
  const [clients, setClients] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const dayOptions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: DAY_COUNT }, (_, idx) => addDays(today, idx));
  }, []);

  const visibleDays = useMemo(() => {
    return dayOptions.slice(weekPage * DAYS_PER_WEEK, weekPage * DAYS_PER_WEEK + DAYS_PER_WEEK);
  }, [dayOptions, weekPage]);

  useEffect(() => {
    const currentWeek = Math.floor(selectedDayIndex / DAYS_PER_WEEK);
    if (currentWeek !== weekPage) {
      setWeekPage(Math.min(Math.max(currentWeek, 0), WEEKS_TO_SHOW - 1));
    }
  }, [selectedDayIndex, weekPage]);

  const serviceDef = useMemo(() => {
    if (serviceCode === CUSTOM_SERVICE_CODE || serviceCode === NO_SERVICE_SELECTED) return null;
    return findServiceByCode(serviceCode);
  }, [serviceCode]);
  const serviceType = serviceDef?.category || manualServiceType;
  const durationMinutes = getServiceDurationMinutes(serviceType, serviceDef);

  useEffect(() => {
    getClients().then(r => setClients(r.data || [])).catch(() => setClients([]));
    getRooms().then(r => setRooms(r.data || [])).catch(() => setRooms([]));
    getEquipment().then(r => setEquipment(r.data || [])).catch(() => setEquipment([]));
  }, []);

  useEffect(() => {
    if (!serviceDef) {
      setFullPrice('');
      return;
    }
    if (serviceDef.defaults?.fullPrice !== undefined && fullPrice === '') {
      setFullPrice(String(serviceDef.defaults.fullPrice));
    }
  }, [serviceDef, fullPrice]);

  useEffect(() => {
    if (!startDate || !endDate) {
      setAvailability(null);
      return;
    }
    const params = { serviceType, startDate, endDate };
    if (serviceType === 'room') {
      if (!roomId) {
        setAvailability(null);
        return;
      }
      params.roomId = roomId;
    } else if (serviceType === 'equipment') {
      if (!equipmentId) {
        setAvailability(null);
        return;
      }
      params.equipmentId = equipmentId;
    } else {
      setAvailability(null);
      return;
    }

    let cancelled = false;
    const run = async () => {
      try {
        const res = await checkAvailability(params);
        if (!cancelled) setAvailability(res.data);
      } catch (err) {
        if (!cancelled) {
          setAvailability({ available: false, error: 'Failed to check availability', calendarConflicts: [] });
        }
      }
    };
    run();
    return () => { cancelled = true; };
  }, [serviceType, roomId, equipmentId, startDate, endDate]);

  const handleWeekNavigate = (direction) => {
    setWeekPage(prev => {
      const next = Math.min(Math.max(prev + direction, 0), WEEKS_TO_SHOW - 1);
      return next;
    });
  };

  const handleDaySelect = (index) => {
    const globalIndex = weekPage * DAYS_PER_WEEK + index;
    setSelectedDayIndex(globalIndex);
    setSelectedTime('');
    setStartDate('');
    setEndDate('');
    setAvailability(null);
  };

  const applySlot = (day, time) => {
    const slot = createSlot(day, time, durationMinutes);
    setStartDate(formatDateTimeLocal(slot.start));
    setEndDate(formatDateTimeLocal(slot.end));
  };

  const handleTimeSelect = (time) => {
    const day = dayOptions[selectedDayIndex] || visibleDays[0];
    if (!day || isPastSlot(day, time)) return;
    setSelectedTime(time);
    applySlot(day, time);
  };

  const handleServiceChange = (value) => {
    setServiceCode(value);
    setRoomId('');
    setEquipmentId('');
    setSelectedTime('');
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
      setFullPrice(def?.defaults?.fullPrice !== undefined ? String(def.defaults.fullPrice) : '');
      setDiscountedPrice('');
    } else {
      setFullPrice('');
      setDiscountedPrice('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!clientId) return setError('Please select a client.');
    if (serviceCode === NO_SERVICE_SELECTED) return setError('Please select a service.');
    const day = dayOptions[selectedDayIndex] || visibleDays[0];
    if (!startDate || !endDate || !day) return setError('Pick a day and start time.');
    if (serviceType === 'room' && !roomId) return setError('Please choose a room.');
    if (serviceType === 'equipment' && !equipmentId) return setError('Please choose equipment.');

    const numericFull = Number(fullPrice);
    if (fullPrice === '' || Number.isNaN(numericFull)) return setError('Full price must be a number.');
    const numericDiscount = discountedPrice === '' ? undefined : Number(discountedPrice);
    if (discountedPrice !== '' && Number.isNaN(numericDiscount)) return setError('Discounted price must be a number.');
    if (numericDiscount !== undefined && numericDiscount > numericFull) return setError('Discounted price cannot exceed full price.');

    const payload = {
      clientId,
      serviceType,
      serviceCode: serviceDef?.code || undefined,
      startDate,
      endDate,
      roomId: serviceType === 'room' ? roomId : undefined,
      equipmentId: serviceType === 'equipment' ? equipmentId : undefined,
      fullPrice: numericFull,
      discountedPrice: numericDiscount,
      priceCurrency: priceCurrency ? priceCurrency.trim().toUpperCase() : DEFAULT_CURRENCY,
      priceNotes: notes ? notes.trim() : undefined,
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

  const durationText = formatDurationText(durationMinutes);
  const currentDay = dayOptions[selectedDayIndex] || visibleDays[0];

  return (
    <MainLayout>
      <div className="page-header">
        <h2 className="page-title">Create Booking</h2>
      </div>
      <form onSubmit={handleSubmit} className="booking-layout">
        {error && <div style={{ color: '#ff6b6b' }}>{error}</div>}

        <section className="booking-section">
          <div className="booking-section__title">Client & Service</div>
          <select className="form-select" value={clientId} onChange={e => setClientId(e.target.value)}>
            <option value="">Select client</option>
            {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          <select className="form-select" value={serviceCode} onChange={e => handleServiceChange(e.target.value)} style={{ marginTop: 12 }}>
            <option value={NO_SERVICE_SELECTED}>Select service</option>
            {SERVICE_CATALOG.map(service => (
              <option key={service.code} value={service.code}>{service.name}</option>
            ))}
            <option value={CUSTOM_SERVICE_CODE}>Manual setup</option>
          </select>

          {serviceCode === CUSTOM_SERVICE_CODE && (
            <select className="form-select" value={manualServiceType} onChange={e => setManualServiceType(e.target.value)} style={{ marginTop: 12 }}>
              {MANUAL_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          )}

          {serviceType === 'room' && (
            <select className="form-select" value={roomId} onChange={e => setRoomId(e.target.value)} style={{ marginTop: 12 }}>
              <option value="">Select room</option>
              {rooms.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
          )}

          {serviceType === 'equipment' && (
            <select className="form-select" value={equipmentId} onChange={e => setEquipmentId(e.target.value)} style={{ marginTop: 12 }}>
              <option value="">Select equipment</option>
              {equipment.map(eq => <option key={eq._id} value={eq._id}>{eq.name}</option>)}
            </select>
          )}
        </section>

        <section className="booking-section">
          <div className="booking-section__title">Schedule</div>
          <div className="booking-week-nav">
            <button type="button" onClick={() => handleWeekNavigate(-1)} disabled={weekPage === 0}>‹ Previous</button>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Week {weekPage + 1} of {WEEKS_TO_SHOW}</span>
            <button type="button" onClick={() => handleWeekNavigate(1)} disabled={weekPage === WEEKS_TO_SHOW - 1}>Next ›</button>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 10 }}>Duration: {durationText}</div>
          <div className="booking-day-scroll">
            {visibleDays.map((day, index) => {
              const globalIndex = weekPage * DAYS_PER_WEEK + index;
              const isSelected = globalIndex === selectedDayIndex;
              return (
                <div
                  key={day.toISOString()}
                  className={`booking-day-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleDaySelect(index)}
                >
                  <span className="booking-day-card__weekday">{day.toLocaleDateString([], { weekday: 'short' })}</span>
                  <span className="booking-day-card__day">{day.getDate()}</span>
                  <span className="booking-day-card__month">{day.toLocaleDateString([], { month: 'short' })}</span>
                </div>
              );
            })}
          </div>

          <div className="booking-time-grid" style={{ marginTop: 16 }}>
            {TIME_OPTIONS.map(time => {
              const disabled = !currentDay || isPastSlot(currentDay, time);
              const classes = ['booking-time-button'];
              if (time === selectedTime) classes.push('is-selected');
              if (disabled) classes.push('is-disabled');
              return (
                <button
                  type="button"
                  key={time}
                  className={classes.join(' ')}
                  onClick={() => !disabled && handleTimeSelect(time)}
                  disabled={disabled}
                >
                  {time}
                </button>
              );
            })}
          </div>

          {availability && (serviceType === 'room' || serviceType === 'equipment') && (
            <div className="booking-availability" style={{ color: availability.available ? '#39ff14' : '#ff6b6b' }}>
              {availability.available ? 'Slot available' : 'Slot not available'}
              {Array.isArray(availability.calendarConflicts) && availability.calendarConflicts.length > 0 && (
                <div className="booking-availability__conflicts">
                  <div>Calendar conflicts:</div>
                  <ul>
                    {availability.calendarConflicts.map(ev => (
                      <li key={ev.id}>{ev.summary || 'Calendar event'} - {new Date(ev.start?.dateTime || ev.start?.date).toLocaleString()}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="booking-section">
          <div className="booking-section__title">Payment & Notes</div>
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

          <select className="form-select" value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} style={{ marginTop: 12 }}>
            {PAYMENT_STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>

          <textarea
            className="form-textarea"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={3}
            style={{ marginTop: 12 }}
          />
        </section>

        <div className="form-actions" style={{ marginTop: 8 }}>
          <button className="btn btn-primary" type="submit">Create</button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/bookings')}>Cancel</button>
        </div>
      </form>
    </MainLayout>
  );
}
