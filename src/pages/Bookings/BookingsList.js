import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { getBookings } from '../../api/bookings';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';
import { findServiceByCode } from '../../constants/services';

export default function BookingsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    getBookings()
      .then(res => setItems(res.data || []))
      .catch(() => setError('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => {
    const name = i.clientId?.name || '';
    return !query || name.toLowerCase().includes(query.toLowerCase());
  });
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    { key: 'clientId', label: 'Client', render: r => r.clientId ? <Link to={`/clients/${r.clientId._id || r.clientId}`}>{r.clientId.name || r.clientId}</Link> : '-' },
    { key: 'service', label: 'Service', render: r => { const def = findServiceByCode(r.serviceCode); return def ? def.name : (r.serviceType || '-'); } },
    { key: 'price', label: 'Price', render: r => {
      const full = typeof r.fullPrice === 'number' ? r.fullPrice : (typeof r.totalFee === 'number' ? r.totalFee : null);
      const discount = typeof r.discountedPrice === 'number' ? r.discountedPrice : null;
      const currency = r.priceCurrency || 'USD';
      if (discount !== null) return `${discount} ${currency} (from ${full ?? '-'})`;
      if (full !== null) return `${full} ${currency}`;
      return '-';
    } },
    { key: 'startDate', label: 'Start', render: r => r.startDate ? new Date(r.startDate).toLocaleString() : '-' },
    { key: 'endDate', label: 'End', render: r => r.endDate ? new Date(r.endDate).toLocaleString() : '-' },
    { key: 'paymentStatus', label: 'Payment', render: r => r.paymentStatus || '-' },
    { key: 'actions', label: 'Actions', render: r => <button onClick={() => navigate(`/bookings/${r._id}/edit`)}>Edit</button> }
  ];

  return (
    <MainLayout>
      <div className="page-header">
        <h2 className="page-title">Bookings</h2>
        <Link to="/bookings/create" className="btn btn-primary add-btn">+ Add Booking</Link>
      </div>
      {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <>
          <SearchFilter value={query} onChange={setQuery} placeholder="Search bookings by client" />
          <DataTable columns={columns} data={pageData} />
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
        </>
      )}
    </MainLayout>
  );
}
