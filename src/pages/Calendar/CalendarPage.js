import React, { useEffect, useState } from 'react';
import { getEvents, syncCalendar } from '../../api/calendar';
import MainLayout from '../../components/MainLayout';

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getEvents();
      setEvents(res.data);
    } catch (err) {
      setError('Failed to load events');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncCalendar();
      await fetchEvents();
    } catch {
      setError('Sync failed');
    }
    setSyncing(false);
  };

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Google Calendar Events</h2>
      <button className="auth-btn" style={{ maxWidth: 200, marginBottom: 20 }} onClick={handleSync} disabled={syncing}>
        {syncing ? 'Syncing...' : 'Manual Sync'}
      </button>
      {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <div style={{ background: '#111', borderRadius: 8, padding: 20 }}>
          {events.length === 0 ? <div>No events found.</div> : (
            <table style={{ width: '100%', color: '#fff' }}>
              <thead>
                <tr style={{ color: '#39ff14' }}>
                  <th>Title</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Room</th>
                </tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev.id}>
                    <td>{ev.summary}</td>
                    <td>{ev.start?.dateTime || ev.start?.date}</td>
                    <td>{ev.end?.dateTime || ev.end?.date}</td>
                    <td>{ev.location || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </MainLayout>
  );
}
