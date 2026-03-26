'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CalendarTask {
  taskId: number;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  project: {
    projectId: number;
    projectName: string;
  };
  list: {
    listId: number;
    listName: string;
  };
  assignedTo: {
    userId: number;
    username: string;
  } | null;
}

type ViewMode = 'month' | 'week';

function getDateKey(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDateKeyFromValue(value: string) {
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  return getDateKey(new Date(value));
}

function startOfWeek(date: Date) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfWeek(date: Date) {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function startOfMonthGrid(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  return startOfWeek(first);
}

function endOfMonthGrid(date: Date) {
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const end = endOfWeek(last);
  end.setHours(23, 59, 59, 999);
  return end;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export default function CalendarPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const range = useMemo(() => {
    if (viewMode === 'week') {
      return {
        start: startOfWeek(anchorDate),
        end: endOfWeek(anchorDate),
      };
    }

    return {
      start: startOfMonthGrid(anchorDate),
      end: endOfMonthGrid(anchorDate),
    };
  }, [viewMode, anchorDate]);

  const dateList = useMemo(() => {
    const dates: Date[] = [];
    let cursor = new Date(range.start);
    while (cursor <= range.end) {
      dates.push(new Date(cursor));
      cursor = addDays(cursor, 1);
    }
    return dates;
  }, [range]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, CalendarTask[]>();
    for (const task of tasks) {
      const key = getDateKeyFromValue(task.dueDate);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(task);
    }

    for (const values of map.values()) {
      values.sort((a, b) => {
        const p = (a.priority || '').localeCompare(b.priority || '');
        if (p !== 0) return p;
        return a.title.localeCompare(b.title);
      });
    }

    return map;
  }, [tasks]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchCalendarTasks = async () => {
      try {
        setLoading(true);
        setError('');
        const start = getDateKey(range.start);
        const end = getDateKey(range.end);

        const response = await fetch(`/api/tasks/calendar?start=${start}&end=${end}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }

        const json = await response.json();
        if (!response.ok) {
          setError(json.error || 'Failed to load calendar tasks');
          return;
        }

        setTasks(json.data || []);
      } catch {
        setError('Failed to load calendar tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarTasks();
  }, [router, range.start, range.end]);

  const movePeriod = (direction: 'prev' | 'next') => {
    const delta = direction === 'prev' ? -1 : 1;
    const next = new Date(anchorDate);
    if (viewMode === 'week') {
      next.setDate(next.getDate() + 7 * delta);
    } else {
      next.setMonth(next.getMonth() + delta);
    }
    setAnchorDate(next);
  };

  const renderTaskChip = (task: CalendarTask) => {
    const isCompleted = task.status === 'Completed';
    const isHigh = task.priority === 'High';

    return (
      <Link href={`/tasks/${task.taskId}`} key={task.taskId} className="task-chip">
        <span className={`task-dot ${isCompleted ? 'done' : isHigh ? 'high' : 'normal'}`}></span>
        <span className="task-chip-title">{task.title}</span>
      </Link>
    );
  };

  const titleLabel =
    viewMode === 'week'
      ? `${range.start.toLocaleDateString()} - ${range.end.toLocaleDateString()}`
      : anchorDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const weekDayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="calendar-page">
      <style jsx>{`
        .calendar-page { animation: fadeIn 0.45s ease-out; }
        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.25rem;
        }
        .calendar-title-wrap h1 {
          font-size: 1.7rem;
          margin: 0;
          color: var(--foreground);
          font-weight: 800;
        }
        .calendar-title-wrap p {
          margin: 0.4rem 0 0;
          color: var(--foreground-secondary);
          font-size: 0.9rem;
        }
        .calendar-controls {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }
        .btn {
          border: 1px solid var(--border-color);
          background: var(--background-secondary);
          color: var(--foreground);
          border-radius: 10px;
          padding: 0.55rem 0.8rem;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
        }
        .btn:hover { border-color: var(--primary-400); }
        .btn.active {
          background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
          border-color: transparent;
          color: #fff;
        }
        .period-label {
          min-width: 240px;
          text-align: center;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--foreground);
          background: var(--background-secondary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 0.55rem 0.7rem;
        }
        .calendar-frame {
          background: var(--background-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 14px 35px rgba(15, 23, 42, 0.08);
        }
        .grid-header {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          border-bottom: 1px solid var(--border-color);
          background: linear-gradient(135deg, rgba(14,165,233,0.09), rgba(37,99,235,0.06));
        }
        .grid-header-item {
          padding: 0.72rem 0.6rem;
          text-align: center;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          color: var(--foreground-secondary);
          text-transform: uppercase;
        }
        .month-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
        }
        .calendar-cell {
          min-height: 128px;
          border-right: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          padding: 0.5rem;
          background: var(--background-secondary);
        }
        .calendar-cell:nth-child(7n) { border-right: none; }
        .date-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.45rem;
        }
        .date-number {
          width: 26px;
          height: 26px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--foreground);
        }
        .date-number.today {
          background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
          color: #fff;
        }
        .date-muted {
          opacity: 0.5;
        }
        .task-stack {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .task-chip {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.28rem 0.38rem;
          background: var(--background);
          color: var(--foreground);
          transition: all 0.2s;
        }
        .task-chip:hover {
          border-color: var(--primary-400);
          transform: translateX(2px);
        }
        .task-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          flex-shrink: 0;
        }
        .task-dot.normal { background: #3b82f6; }
        .task-dot.high { background: #ef4444; }
        .task-dot.done { background: #10b981; }
        .task-chip-title {
          font-size: 0.73rem;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .more-count {
          margin-top: 0.1rem;
          font-size: 0.7rem;
          color: var(--foreground-secondary);
          font-weight: 700;
        }
        .week-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
        }
        .week-col {
          min-height: 420px;
          border-right: 1px solid var(--border-color);
          padding: 0.5rem;
        }
        .week-col:last-child { border-right: none; }
        .week-col-head {
          margin-bottom: 0.45rem;
          padding-bottom: 0.4rem;
          border-bottom: 1px dashed var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.35rem;
        }
        .week-col-day {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--foreground);
        }
        .week-col-date {
          font-size: 0.72rem;
          color: var(--foreground-secondary);
        }
        .empty-state {
          padding: 2rem;
          text-align: center;
          color: var(--foreground-secondary);
          font-weight: 600;
        }
        .error-text {
          margin-bottom: 0.9rem;
          color: var(--danger-600);
          font-size: 0.9rem;
          font-weight: 700;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 900px) {
          .calendar-header { align-items: flex-start; }
          .period-label { min-width: 180px; }
          .calendar-cell { min-height: 106px; }
          .week-col { min-height: 320px; }
        }
      `}</style>

      <div className="calendar-header">
        <div className="calendar-title-wrap">
          <h1>Task Calendar</h1>
          <p>Track deadlines in month and week views for a strong visual demo.</p>
        </div>

        <div className="calendar-controls">
          <button className={`btn ${viewMode === 'month' ? 'active' : ''}`} onClick={() => setViewMode('month')}>
            Month
          </button>
          <button className={`btn ${viewMode === 'week' ? 'active' : ''}`} onClick={() => setViewMode('week')}>
            Week
          </button>
          <button className="btn" onClick={() => movePeriod('prev')}>◀</button>
          <div className="period-label">{titleLabel}</div>
          <button className="btn" onClick={() => movePeriod('next')}>▶</button>
          <button className="btn" onClick={() => setAnchorDate(new Date())}>Today</button>
        </div>
      </div>

      {error && <div className="error-text">{error}</div>}

      <div className="calendar-frame">
        <div className="grid-header">
          {weekDayHeaders.map((name) => (
            <div key={name} className="grid-header-item">{name}</div>
          ))}
        </div>

        {loading ? (
          <div className="empty-state">Loading calendar...</div>
        ) : viewMode === 'month' ? (
          <div className="month-grid">
            {dateList.map((date) => {
              const key = getDateKey(date);
              const dayTasks = tasksByDate.get(key) || [];
              const today = getDateKey(new Date()) === key;
              const muted = date.getMonth() !== anchorDate.getMonth();
              const visible = dayTasks.slice(0, 3);

              return (
                <div key={key} className="calendar-cell">
                  <div className="date-head">
                    <span className={`date-number ${today ? 'today' : ''} ${muted ? 'date-muted' : ''}`}>
                      {date.getDate()}
                    </span>
                  </div>
                  <div className="task-stack">
                    {visible.map((task) => renderTaskChip(task))}
                    {dayTasks.length > visible.length && (
                      <div className="more-count">+{dayTasks.length - visible.length} more tasks</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="week-grid">
            {dateList.map((date) => {
              const key = getDateKey(date);
              const dayTasks = tasksByDate.get(key) || [];
              const today = getDateKey(new Date()) === key;

              return (
                <div key={key} className="week-col">
                  <div className="week-col-head">
                    <span className="week-col-day">{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                    <span className={`date-number ${today ? 'today' : ''}`}>{date.getDate()}</span>
                  </div>
                  <div className="task-stack">
                    {dayTasks.length === 0 && <div className="more-count">No due tasks</div>}
                    {dayTasks.map((task) => renderTaskChip(task))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
