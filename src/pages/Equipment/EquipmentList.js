import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { getEquipment } from '../../api/equipment';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';

export default function EquipmentList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    getEquipment()
      .then(res => setItems(res.data || []))
      .catch(() => setError('Failed to load equipment'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => !query || (i.name && i.name.toLowerCase().includes(query.toLowerCase())));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    { key: 'name', label: 'Name', render: r => <Link to={`/equipment/${r._id}`} style={{ color: '#39ff14' }}>{r.name}</Link> },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', render: r => <button onClick={() => navigate(`/equipment/${r._id}/edit`)}>Edit</button> }
  ];

  return (
    <MainLayout>
      <div className="page-header">
        <h2 className="page-title">Equipment</h2>
  <Link to="/equipment/create" className="btn btn-primary add-btn">+ Add Equipment</Link>
      </div>
      {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <>
          <SearchFilter value={query} onChange={setQuery} placeholder="Search equipment" />
          <DataTable columns={columns} data={pageData} />
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
        </>
      )}
    </MainLayout>
  );
}
