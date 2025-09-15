import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { getEnrollments } from '../../api/enrollments';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';

export default function EnrollmentsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    getEnrollments()
      .then(res => setItems(res.data || []))
      .catch(() => setError('Failed to load enrollments'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => {
    const name = i.studentId?.name || '';
    return !query || name.toLowerCase().includes(query.toLowerCase());
  });
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    { key: 'studentId', label: 'Student', render: r => r.studentId?.name || r.studentId || '-' },
    { key: 'classId', label: 'Class', render: r => r.classId?.name || r.classId || '-' },
    { key: 'paymentStatus', label: 'Payment', render: r => r.paymentStatus || '-' }
  ];

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Enrollments</h2>
      {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <>
          <SearchFilter value={query} onChange={setQuery} placeholder="Search enrollments by client" />
          <DataTable columns={columns} data={pageData} />
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
        </>
      )}
    </MainLayout>
  );
}
