import React, { useEffect, useState } from 'react';
import { getClients, deleteClient } from '../../api/clients';
import MainLayout from '../../components/MainLayout';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';

export default function ClientsList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    getClients()
      .then(res => setClients(res.data || []))
      .catch(() => setError('Failed to load clients'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this client?')) return;
    await deleteClient(id);
    setClients(clients.filter(c => c._id !== id));
  };

  // filtering + pagination
  const filtered = clients.filter(c => !query || (c.name && c.name.toLowerCase().includes(query.toLowerCase())) || (c.email && c.email.toLowerCase().includes(query.toLowerCase())));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    { key: 'name', label: 'Name', render: (r) => <Link to={`/clients/${r._id}`} className="client-link">{r.name}</Link> },
    { key: 'type', label: 'Type' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'actions', label: 'Actions', render: (r) => (
      <>
        <button className="btn btn-ghost" onClick={() => navigate(`/clients/${r._id}/edit`)} style={{ marginRight: 8 }}>Edit</button>
        <button className="btn" onClick={() => handleDelete(r._id)} style={{ background: 'transparent', color: '#ff3b3b', border: '1px solid #3a1a1a' }}>Delete</button>
      </>
    ) }
  ];

  return (
    <MainLayout>
      <div className="page-header">
        <h2 className="page-title">Clients</h2>
  <Link to="/clients/create" className="btn btn-primary add-btn">+ Add Client</Link>
      </div>
      {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <>
          <SearchFilter value={query} onChange={setQuery} placeholder="Search clients by name or email" />
          <DataTable columns={columns} data={pageData} />
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
        </>
      )}
    </MainLayout>
  );
}
