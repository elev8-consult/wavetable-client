import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { getAttendance, updateAttendance, bulkMarkSessionPresent } from '../../api/attendance';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';

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
    const name = i.studentId?.name || '';
    return !query || name.toLowerCase().includes(query.toLowerCase());
  });
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    { key: 'studentId', label: 'Student', render: r => r.studentId?.name || r.studentId || '-' },
    { key: 'classId', label: 'Class', render: r => r.classId?.name || r.classId || '-' },
    { key: 'sessionDate', label: 'Date', render: r => r.sessionDate ? new Date(r.sessionDate).toLocaleString() : '-' },
    { key: 'status', label: 'Status', render: r => (
      <button className={`btn ${r.status === 'present' ? 'btn-ghost' : 'btn-primary'}`} onClick={() => toggleStatus(r)}>
        {r.status === 'present' ? 'Present' : 'Absent'}
      </button>
    ) }
  ];

  const toggleStatus = async (row) => {
    try {
      const newStatus = row.status === 'present' ? 'absent' : 'present';
      await updateAttendance(row._id, { status: newStatus });
      setItems(items.map(i => i._id === row._id ? { ...i, status: newStatus } : i));
    } catch (err) {
      setError('Failed to update attendance');
    }
  };

  const markAllPresent = async () => {
    try {
      // use the current filter to determine classId and sessionDate if available on first item
      if (!items.length) return;
      const first = items[0];
      const classId = first.classId ? (first.classId._id || first.classId) : null;
      const sessionDate = first.sessionDate || null;
      if (!classId || !sessionDate) return setError('Cannot determine class/session for bulk mark');
      await bulkMarkSessionPresent({ classId, sessionDate });
      // update client state
      setItems(items.map(i => ({ ...i, status: 'present' })));
    } catch (err) {
      setError('Failed bulk mark');
    }
  };

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Attendance</h2>
      {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SearchFilter value={query} onChange={setQuery} placeholder="Search attendance by client" />
            <button className="btn btn-primary" onClick={markAllPresent}>Mark all present</button>
          </div>
          <DataTable columns={columns} data={pageData} />
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
        </>
      )}
    </MainLayout>
  );
}
