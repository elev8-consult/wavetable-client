import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { getPayments } from '../../api/payments';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';

export default function PaymentsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    getPayments()
      .then(res => setItems(res.data || []))
      .catch(() => setError('Failed to load payments'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => {
    const name = i.clientId?.name || '';
    return !query || name.toLowerCase().includes(query.toLowerCase());
  });
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    { key: 'clientId', label: 'Client', render: r => r.clientId?.name || r.clientId || '-' },
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount', render: r => r.amount },
    { key: 'date', label: 'Date', render: r => r.date ? new Date(r.date).toLocaleDateString() : '-' }
  ];

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Payments</h2>
      {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <>
          <SearchFilter value={query} onChange={setQuery} placeholder="Search payments by client" />
          <DataTable columns={columns} data={pageData} />
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
        </>
      )}
    </MainLayout>
  );
}
