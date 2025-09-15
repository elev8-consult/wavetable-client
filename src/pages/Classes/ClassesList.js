import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { getClasses } from '../../api/classes';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';

export default function ClassesList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    getClasses()
      .then(res => setItems(res.data || []))
      .catch(() => setError('Failed to load classes'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => !query || (i.name && i.name.toLowerCase().includes(query.toLowerCase())));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    { key: 'name', label: 'Name', render: r => <Link to={`/classes/${r._id}`} style={{ color: '#39ff14' }}>{r.name}</Link> },
    { key: 'instructor', label: 'Instructor', render: r => r.instructor },
    { key: 'schedule', label: 'Sessions', render: r => Array.isArray(r.schedule) ? r.schedule.length : 0 },
    { key: 'actions', label: 'Actions', render: r => <button onClick={() => navigate(`/classes/${r._id}/edit`)}>Edit</button> }
  ];

  return (
    <MainLayout>
      <div className="page-header">
        <h2 className="page-title">Classes</h2>
        <Link to="/classes/create" className="btn btn-primary add-btn">+ Add Class</Link>
      </div>
      {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <>
          <SearchFilter value={query} onChange={setQuery} placeholder="Search classes" />
          <DataTable columns={columns} data={pageData} />
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
        </>
      )}
    </MainLayout>
  );
}
