import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { getRooms } from '../../api/rooms';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';

export default function RoomsList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    getRooms()
      .then(res => setRooms(res.data || []))
      .catch(() => setError('Failed to load rooms'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rooms.filter(r => !query || (r.name && r.name.toLowerCase().includes(query.toLowerCase())));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    { key: 'name', label: 'Name', render: r => <Link to={`/rooms/${r._id}`} style={{ color: '#39ff14' }}>{r.name}</Link> },
    { key: 'type', label: 'Type' },
    { key: 'hourlyRate', label: 'Hourly Rate' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'actions', label: 'Actions', render: r => <button onClick={() => navigate(`/rooms/${r._id}/edit`)}>Edit</button> }
  ];

  return (
    <MainLayout>
      <div className="page-header">
        <h2 className="page-title">Rooms</h2>
        <Link to="/rooms/create" className="btn btn-primary add-btn">+ Add Room</Link>
      </div>
      {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <>
          <SearchFilter value={query} onChange={setQuery} placeholder="Search rooms" />
          <DataTable columns={columns} data={pageData} />
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
        </>
      )}
    </MainLayout>
  );
}
