import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getEvents, syncCalendar } from '../../api/calendar';
import MainLayout from '../../components/MainLayout';
import './CalendarPage.css';

const DISPLAY_START_HOUR = 12;
const DISPLAY_END_HOUR = 24;
const DISPLAY_START_MINUTES = DISPLAY_START_HOUR * 60;
const DISPLAY_END_MINUTES = DISPLAY_END_HOUR * 60;
const DISPLAY_RANGE_MINUTES = DISPLAY_END_MINUTES - DISPLAY_START_MINUTES;
const HOURS = Array.from({ length: DISPLAY_END_HOUR - DISPLAY_START_HOUR }, (_, i) => DISPLAY_START_HOUR + i);
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, amount) {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

function formatWeekRange(start, end) {
  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();
  const startLabel = `${MONTH_NAMES[start.getMonth()]} ${start.getDate()}`;
  const endLabel = `${sameMonth ? '' : MONTH_NAMES[end.getMonth()] + ' '}${end.getDate()}`;
  if (sameYear) {
    return `${startLabel} – ${endLabel}, ${start.getFullYear()}`;
  }
  return `${startLabel}, ${start.getFullYear()} – ${MONTH_NAMES[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
}

function parseEventDate(eventPart) {
  if (!eventPart) return null;
  if (eventPart.dateTime) return new Date(eventPart.dateTime);
  if (eventPart.date) return new Date(`${eventPart.date}T00:00:00`);
  return null;
}

function getMinutes(date) {
  return date.getHours() * 60 + date.getMinutes();
}

function clampEventToDay(event, dayStart, dayEnd) {
  let start = event.start < dayStart ? dayStart : event.start;
  let end = event.end > dayEnd ? dayEnd : event.end;
  if (end <= start) return null;
  if (end.getTime() === dayEnd.getTime()) {
    end = new Date(end.getTime() - 1);
  }
  return { ...event, displayStart: start, displayEnd: end };
}

function formatHourLabel(hour) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date.toLocaleTimeString([], { hour: 'numeric' });
}

function formatDayHeader(date) {
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatEventTimeRange(start, end, isAllDay) {
  if (isAllDay) return 'All day';
  const opts = { hour: 'numeric', minute: '2-digit' };
  return `${start.toLocaleTimeString([], opts)} – ${end.toLocaleTimeString([], opts)}`;
}

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  const weekEnd = useMemo(() => addDays(weekStart, 7), [weekStart]);

  const fetchEvents = useCallback(async (rangeStart, rangeEnd) => {
    setLoading(true);
    setError('');
    try {
      const res = await getEvents({
        start: rangeStart.toISOString(),
        end: rangeEnd.toISOString()
      });
      setEvents(res.data || []);
    } catch (err) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(weekStart, weekEnd);
  }, [fetchEvents, weekStart, weekEnd]);

  const handleWeekChange = (offset) => {
    setWeekStart(prev => startOfWeek(addDays(prev, offset * 7)));
  };

  const handleToday = () => {
    setWeekStart(startOfWeek(new Date()));
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncCalendar();
      await fetchEvents(weekStart, weekEnd);
    } catch (err) {
      setError('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const normalizedEvents = useMemo(() => {
    return (events || [])
      .map(ev => {
        const start = parseEventDate(ev.start);
        const end = parseEventDate(ev.end);
        if (!start || !end) return null;
        const allDay = !!ev.start?.date && !ev.start?.dateTime;
        // Google all-day events are exclusive of the end day; subtract a minute
        const adjustedEnd = allDay ? new Date(end.getTime() - 1) : end;
        return {
          id: ev.id,
          summary: ev.summary || 'Untitled event',
          location: ev.location || '',
          start,
          end: adjustedEnd,
          allDay,
        };
      })
      .filter(Boolean);
  }, [events]);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const eventsByDay = useMemo(() => {
    return weekDays.map(dayStart => {
      const dayEnd = addDays(dayStart, 1);
      const allDayEvents = [];
      const timedEvents = [];

      normalizedEvents.forEach(event => {
        if (event.end < dayStart || event.start >= dayEnd) return;
        if (event.allDay) {
          allDayEvents.push(event);
          return;
        }
        const clipped = clampEventToDay(event, dayStart, dayEnd);
        if (clipped) timedEvents.push(clipped);
      });

      return {
        date: dayStart,
        allDayEvents,
        timedEvents,
      };
    });
  }, [normalizedEvents, weekDays]);

  const weekLabel = useMemo(() => formatWeekRange(weekStart, addDays(weekStart, 6)), [weekStart]);

  return (
    <MainLayout>
      <div className="calendar-page-header">
        <div className="calendar-page-header__title">
          <h2 className="page-title">Weekly Calendar</h2>
          <span className="calendar-page-header__range">{weekLabel}</span>
        </div>
        <div className="calendar-page-header__actions">
          <button className="btn btn-ghost" onClick={() => handleWeekChange(-1)}>‹ Previous</button>
          <button className="btn btn-ghost" onClick={handleToday}>Today</button>
          <button className="btn btn-ghost" onClick={() => handleWeekChange(1)}>Next ›</button>
          <button className="btn btn-primary" onClick={handleSync} disabled={syncing}>
            {syncing ? 'Syncing…' : 'Sync Calendar'}
          </button>
        </div>
      </div>
      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <div className="calendar-week">
          <div className="calendar-week__header-row">
            <div className="calendar-week__time-spacer" />
            {eventsByDay.map(({ date }, idx) => {
              const isToday = new Date().toDateString() === date.toDateString();
              return (
                <div
                  key={idx}
                  className={`calendar-week__day-header${isToday ? ' is-today' : ''}`}
                >
                  <div className="calendar-week__day-header__weekday">
                    {date.toLocaleDateString([], { weekday: 'short' })}
                  </div>
                  <div className="calendar-week__day-header__date">{date.getDate()}</div>
                </div>
              );
            })}
          </div>
          <div className="calendar-week__body">
            <div className="calendar-week__time-column">
              {HOURS.map(hour => (
                <div key={hour} className="calendar-week__time-cell">
                  <span>{formatHourLabel(hour)}</span>
                </div>
              ))}
            </div>
            {eventsByDay.map(({ date, allDayEvents, timedEvents }, idx) => {
              const isToday = new Date().toDateString() === date.toDateString();
              return (
                <div key={idx} className={`calendar-week__day-column${isToday ? ' is-today' : ''}`}>
                  <div className="calendar-week__all-day">
                    {allDayEvents.length === 0 ? (
                      <div className="calendar-week__all-day--placeholder">No all-day events</div>
                    ) : (
                      allDayEvents.map(event => (
                        <div key={event.id} className="calendar-week__all-day-event">
                          <div className="calendar-week__event-title">{event.summary}</div>
                          {event.location && <div className="calendar-week__event-location">{event.location}</div>}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="calendar-week__day-grid" style={{ height: `calc(var(--calendar-hour-height) * ${HOURS.length})` }}>
                    {HOURS.map(hour => (
                      <div key={hour} className="calendar-week__hour-slot" />
                    ))}
                    {timedEvents.map(event => {
                      const startMinutes = getMinutes(event.displayStart);
                      const endMinutes = getMinutes(event.displayEnd);
                      const clampedStart = Math.max(startMinutes, DISPLAY_START_MINUTES);
                      const clampedEnd = Math.min(endMinutes, DISPLAY_END_MINUTES);
                      if (clampedEnd <= clampedStart) return null;
                      const top = ((clampedStart - DISPLAY_START_MINUTES) / DISPLAY_RANGE_MINUTES) * 100;
                      const height = Math.max(((clampedEnd - clampedStart) / DISPLAY_RANGE_MINUTES) * 100, 4);
                      return (
                        <div
                          key={`${event.id}-${clampedStart}`}
                          className="calendar-week__event"
                          style={{ top: `${top}%`, height: `${height}%` }}
                        >
                          <div className="calendar-week__event-title">{event.summary}</div>
                          <div className="calendar-week__event-time">{formatEventTimeRange(event.displayStart, event.displayEnd, event.allDay)}</div>
                          {event.location && <div className="calendar-week__event-location">{event.location}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </MainLayout>
  );
}
