import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/MainLayout';
import { getAttendance, updateAttendance, bulkMarkSessionPresent } from '../../api/attendance';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';

const STATUS_CYCLE = ['scheduled', 'present', 'absent', 'cancelled'];

export default function AttendanceList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    getAttendance()
      .then(res => setItems(res.data || []))
      .catch(() => setError('Failed to load attendance'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => {
    const name = i.clientId?.name || '';
    return !query || name.toLowerCase().includes(query.toLowerCase());
  });
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const cycleStatus = status => {
    const idx = STATUS_CYCLE.indexOf(status);
    return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
  };

  const updateStatus = async (row) => {
    try {
      const newStatus = cycleStatus(row.status || 'scheduled');
      await updateAttendance(row._id, { status: newStatus });
      setItems(items.map(i => i._id === row._id ? { ...i, status: newStatus } : i));
    } catch (err) {
      setError('Failed to update attendance');
    }
  };

  const markBookingPresent = async (row) => {
    try {
      if (!row.bookingId?._id && !row.bookingId) return;
      const bookingId = row.bookingId?._id || row.bookingId;
      await bulkMarkSessionPresent({ bookingId });
      setItems(items.map(i => i.bookingId && (i.bookingId._id || i.bookingId) === bookingId ? { ...i, status: 'present' } : i));
    } catch (err) {
      setError('Failed to bulk mark attendance');
    }
  };

  const columns = [
    { key: 'clientId', label: 'Client', render: r => r.clientId?.name || r.clientId || '-' },
    {
      key: 'bookingId',
      label: 'Booking',
      render: r => {
        if (!r.bookingId) return '-';
        const booking = r.bookingId;
        const labelParts = [];
        if (booking.serviceCode) labelParts.push(booking.serviceCode.replace(/_/g, ' '));
        if (booking.serviceType && !labelParts.length) labelParts.push(booking.serviceType);
        if (booking.startDate) labelParts.push(new Date(booking.startDate).toLocaleString());
        const label = labelParts.join(' • ') || (booking._id || booking);
        return <Link to={`/bookings/${booking._id || booking}`}>{label}</Link>;
      }
    },
    {
      key: 'sessionDate',
      label: 'Session',
      render: r => r.sessionDate ? new Date(r.sessionDate).toLocaleString() : '-'
    },
    {
      key: 'status',
      label: 'Status',
      render: r => (
        <button className="btn btn-ghost" onClick={() => updateStatus(r)}>
          {r.status || 'scheduled'}
        </button>
      )
    },
    {
      key: 'notes',
      label: 'Notes',
      render: r => r.notes || '—'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: r => (
        <button className="btn btn-primary" onClick={() => markBookingPresent(r)} disabled={!r.bookingId}>Mark booking present</button>
      )
    }
  ];

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Attendance</h2>
      {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <>
          <SearchFilter value={query} onChange={setQuery} placeholder="Search attendance by client" />
          <DataTable columns={columns} data={pageData} />
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
        </>
      )}
    </MainLayout>
  );
}
