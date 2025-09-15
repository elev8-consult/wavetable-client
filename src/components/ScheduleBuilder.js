import React, { useEffect, useMemo, useState } from 'react';
import { checkAvailability } from '../api/bookings';

export default function ScheduleBuilder({
  schedule = [],
  onChange,
  sessionLength = 60,
  onSessionLengthChange,
  roomId
}) {
  const [list, setList] = useState(() => Array.isArray(schedule) ? schedule.slice() : []);
  const [newSession, setNewSession] = useState('');
  const [recDays, setRecDays] = useState({ 0:false,1:false,2:false,3:false,4:false,5:false,6:false });
  const [recStartDate, setRecStartDate] = useState('');
  const [recEndDate, setRecEndDate] = useState('');
  const [recTime, setRecTime] = useState('18:00');
  // Fixed all-week grid generator
  const [gridStartDate, setGridStartDate] = useState('');
  const [gridEndDate, setGridEndDate] = useState('');
  const [firstStart, setFirstStart] = useState('12:00');
  const [lastStart, setLastStart] = useState('21:00');
  const [checking, setChecking] = useState(false);
  const [conflicts, setConflicts] = useState({}); // iso -> boolean (true if conflict)

  // Sync from parent only when content actually differs
  useEffect(() => {
    const next = Array.isArray(schedule) ? schedule.slice().sort() : [];
    setList(prev => arraysEqual(prev, next) ? prev : next);
  }, [schedule]);

  // Notify parent only when local list changes
  useEffect(() => { onChange && onChange(list); }, [list]);

  const formatted = useMemo(() => list.slice().sort().map(s => ({
    iso: s,
    label: fmtLocal(s),
    conflict: conflicts[s] === true,
  })), [list, conflicts]);

  function addSession(dt) {
    if (!dt) return;
    try {
      const iso = new Date(dt).toISOString();
      setList(prev => dedupe(prev.concat(iso)));
    } catch {}
  }

  function removeSession(iso) {
    setList(prev => prev.filter(x => x !== iso));
  }

  function dedupe(arr) {
    return Array.from(new Set(arr)).sort();
  }

  function generateWeekly() {
    if (!recStartDate || !recEndDate) return;
    const start = new Date(recStartDate);
    const end = new Date(recEndDate);
    if (end < start) return;
    const days = Object.keys(recDays).filter(k => recDays[k]).map(Number);
    if (!days.length) return;
    const results = [];
    const cur = new Date(start);
    while (cur <= end) {
      if (days.includes(cur.getDay())) {
        const [hh, mm] = recTime.split(':').map(Number);
        const inst = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate(), hh || 0, mm || 0, 0, 0);
        results.push(inst.toISOString());
      }
      cur.setDate(cur.getDate() + 1);
    }
    if (results.length) setList(prev => dedupe(prev.concat(results)));
  }

  function parseTimeToMinutes(t) {
    const [h, m] = String(t || '00:00').split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  function minutesToDate(baseDate, minutes) {
    const hh = Math.floor(minutes / 60);
    const mm = minutes % 60;
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hh, mm, 0, 0);
  }

  function generateFixedAllWeek() {
    if (!gridStartDate || !gridEndDate) return;
    const startD = new Date(gridStartDate);
    const endD = new Date(gridEndDate);
    if (endD < startD) return;
    const slot = Number(sessionLength) || 90;
    const firstMin = parseTimeToMinutes(firstStart);
    const lastMin = parseTimeToMinutes(lastStart);
    if (lastMin < firstMin) return;
    const results = [];
    const cur = new Date(startD);
    while (cur <= endD) {
      for (let m = firstMin; m <= lastMin; m += slot) {
        const dt = minutesToDate(cur, m);
        results.push(dt.toISOString());
      }
      cur.setDate(cur.getDate() + 1);
    }
    if (results.length) setList(prev => dedupe(prev.concat(results)));
  }

  async function checkRoomAvailability() {
    const rid = roomId && typeof roomId === 'object' ? (roomId._id || roomId.id || '') : roomId;
    if (!rid || !sessionLength || list.length === 0) return;
    setChecking(true);
    const next = {};
    try {
      for (const iso of list) {
        const start = new Date(iso);
        const end = new Date(start.getTime() + (Number(sessionLength) || 60) * 60000);
        try {
          const res = await checkAvailability({ serviceType: 'room', roomId: rid, startDate: start.toISOString(), endDate: end.toISOString() });
          next[iso] = !(res.data && res.data.available);
        } catch {
          next[iso] = true; // on error treat as conflict
        }
      }
      setConflicts(next);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ fontWeight: 600 }}>Manual Sessions</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="datetime-local" value={newSession} onChange={e => setNewSession(e.target.value)} />
          <button className="btn btn-primary" type="button" onClick={() => { addSession(newSession); setNewSession(''); }}>Add</button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ fontWeight: 600 }}>Weekly Recurrence</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((lbl, idx) => (
            <label key={idx} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
              <input type="checkbox" checked={!!recDays[idx]} onChange={e => setRecDays({ ...recDays, [idx]: e.target.checked })} />
              {lbl}
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input type="date" value={recStartDate} onChange={e => setRecStartDate(e.target.value)} placeholder="Start" />
          <input type="date" value={recEndDate} onChange={e => setRecEndDate(e.target.value)} placeholder="End" />
          <input type="time" value={recTime} onChange={e => setRecTime(e.target.value)} />
          <button className="btn" type="button" onClick={generateWeekly}>Generate</button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ fontWeight: 600 }}>Fixed Daily Slots (All Week)</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="date" value={gridStartDate} onChange={e => setGridStartDate(e.target.value)} placeholder="Start" />
          <input type="date" value={gridEndDate} onChange={e => setGridEndDate(e.target.value)} placeholder="End" />
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>First start
            <input type="time" value={firstStart} onChange={e => setFirstStart(e.target.value)} /></label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>Last start
            <input type="time" value={lastStart} onChange={e => setLastStart(e.target.value)} /></label>
          <button className="btn" type="button" onClick={generateFixedAllWeek}>Generate All-Week Grid</button>
        </div>
        <div style={{ fontSize: 12, color: '#aaa' }}>Default: 12:00 to 21:00, session length {sessionLength} minutes.</div>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ fontWeight: 600 }}>Sessions ({formatted.length})</div>
        <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #333', borderRadius: 8, padding: 8 }}>
          {formatted.length === 0 ? (
            <div style={{ color: '#aaa' }}>No sessions added.</div>
          ) : (
            formatted.map(s => (
              <div key={s.iso} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px', borderBottom: '1px dashed #2a2a2a' }}>
                <div>
                  <span>{s.label}</span>
                  {roomId && (
                    <span style={{ marginLeft: 10, fontSize: 12, color: s.conflict ? '#ff3b3b' : '#39ff14' }}>
                      {conflicts.hasOwnProperty(s.iso) ? (s.conflict ? 'conflict' : 'ok') : ''}
                    </span>
                  )}
                </div>
                <button className="btn btn-ghost" type="button" onClick={() => removeSession(s.iso)}>Remove</button>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          Session length (min)
          <input type="number" min="1" style={{ width: 100 }} value={sessionLength} onChange={e => onSessionLengthChange && onSessionLengthChange(Number(e.target.value))} />
        </label>
        {roomId && (
          <button className="btn" type="button" onClick={checkRoomAvailability} disabled={checking || list.length === 0}>
            {checking ? 'Checking...' : 'Check Room Availability'}
          </button>
        )}
      </div>
    </div>
  );
}

function fmtLocal(iso) {
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day} ${hh}:${mm}`;
  } catch { return iso; }
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
