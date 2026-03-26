'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  project?: { name: string };
  assignee?: { name: string };
}

interface SavedSearch {
  id: string;
  label: string;
  query: string;
  status: string;
  priority: string;
  assignee: string;
  dueDateFrom: string;
  dueDateTo: string;
}

interface UserOption {
  userId: number;
  username: string;
}

export default function TaskSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [dueDateFrom, setDueDateFrom] = useState('');
  const [dueDateTo, setDueDateTo] = useState('');
  const [results, setResults] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  const buildAutoSearchLabel = (q: string, s: string, p: string, a: string, df: string, dt: string) => {
    if (q.trim()) {
      return `Search: ${q.trim().slice(0, 36)}`;
    }

    const bits: string[] = [];
    if (p) bits.push(p);
    if (s) bits.push(s);
    if (a) {
      const user = users.find(u => String(u.userId) === a);
      bits.push(user ? `Assignee ${user.username}` : `Assignee ${a}`);
    }
    if (df || dt) bits.push(`Due ${df || '...'} to ${dt || '...'}`);

    return bits.length > 0 ? bits.join(' | ') : 'Search';
  };

  const autoSaveSearch = (q: string, s: string, p: string, a: string, df: string, dt: string) => {
    const normalized = {
      query: q.trim(),
      status: s,
      priority: p,
      assignee: a,
      dueDateFrom: df,
      dueDateTo: dt,
    };

    const searchKey = JSON.stringify(normalized);
    const label = buildAutoSearchLabel(q, s, p, a, df, dt);

    setSavedSearches((prev) => {
      const idx = prev.findIndex((item) =>
        JSON.stringify({
          query: item.query.trim(),
          status: item.status,
          priority: item.priority,
          assignee: item.assignee,
          dueDateFrom: item.dueDateFrom,
          dueDateTo: item.dueDateTo,
        }) === searchKey
      );

      let updated: SavedSearch[];
      if (idx >= 0) {
        const existing = prev[idx];
        const moved = [...prev];
        moved.splice(idx, 1);
        updated = [{ ...existing, label }, ...moved];
      } else {
        const created: SavedSearch = {
          id: Date.now().toString(),
          label,
          ...normalized,
        };
        updated = [created, ...prev].slice(0, 20);
      }

      localStorage.setItem('saved_searches', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const stored = localStorage.getItem('saved_searches');
    if (stored) {
      try { setSavedSearches(JSON.parse(stored)); } catch { }
    }
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.data) {
            setUsers(data.data.map((u: any) => ({ userId: u.userId, username: u.username })));
          }
        })
        .catch(() => { });
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent, overrides?: { query?: string; status?: string; priority?: string; assignee?: string; dueDateFrom?: string; dueDateTo?: string }) => {
    if (e) e.preventDefault();

    const q = overrides?.query ?? searchQuery;
    const s = overrides?.status ?? statusFilter;
    const p = overrides?.priority ?? priorityFilter;
    const a = overrides?.assignee ?? assigneeFilter;
    const df = overrides?.dueDateFrom ?? dueDateFrom;
    const dt = overrides?.dueDateTo ?? dueDateTo;

    if (!q.trim() && !s && !p && !a && !df && !dt) return;

    setIsLoading(true);
    setHasSearched(true);
    autoSaveSearch(q, s, p, a, df, dt);

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (q.trim()) params.append('query', q.trim());
      if (s) params.append('status', s);
      if (p) params.append('priority', p);
      if (a) params.append('assignee', a);
      if (df) params.append('dueDateFrom', df);
      if (dt) params.append('dueDateTo', dt);

      const response = await fetch(`/api/tasks/search?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const json = await response.json();
        const tasksArr = json.data || [];
        const mapped = (Array.isArray(tasksArr) ? tasksArr : []).map((t: any) => ({
          id: t.taskId || t.id,
          title: t.title || '',
          description: t.description || null,
          priority: t.priority || 'Medium',
          status: t.status || 'Pending',
          dueDate: t.dueDate || null,
          project: { name: t.project?.projectName || '' },
          assignee: { name: t.assignedTo?.username || '' },
        }));
        setResults(mapped);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      const hasAnyFilter = !!(statusFilter || priorityFilter || assigneeFilter || dueDateFrom || dueDateTo);
      if (hasAnyFilter) {
        handleSearch(undefined, {
          query: '',
          status: statusFilter,
          priority: priorityFilter,
          assignee: assigneeFilter,
          dueDateFrom,
          dueDateTo,
        });
      } else {
        setResults([]);
        setHasSearched(false);
        setIsLoading(false);
      }
      return;
    }

    const timer = setTimeout(() => {
      handleSearch(undefined, {
        query: searchQuery,
        status: statusFilter,
        priority: priorityFilter,
        assignee: assigneeFilter,
        dueDateFrom,
        dueDateTo,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const applyQuickFilter = (overrides: { query?: string; status?: string; priority?: string }) => {
    setSearchQuery(overrides.query ?? '');
    setStatusFilter(overrides.status ?? '');
    setPriorityFilter(overrides.priority ?? '');
    setAssigneeFilter('');
    setDueDateFrom('');
    setDueDateTo('');
    handleSearch(undefined, { ...overrides, assignee: '', dueDateFrom: '', dueDateTo: '' });
  };

  const applySavedSearch = (ss: SavedSearch) => {
    setSearchQuery(ss.query);
    setStatusFilter(ss.status);
    setPriorityFilter(ss.priority);
    setAssigneeFilter(ss.assignee);
    setDueDateFrom(ss.dueDateFrom);
    setDueDateTo(ss.dueDateTo);
    handleSearch(undefined, { query: ss.query, status: ss.status, priority: ss.priority, assignee: ss.assignee, dueDateFrom: ss.dueDateFrom, dueDateTo: ss.dueDateTo });
  };

  const deleteSavedSearch = (id: string) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('saved_searches', JSON.stringify(updated));
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed': return { bg: 'var(--success-100)', color: 'var(--success-600)' };
      case 'In Progress': return { bg: 'var(--primary-100)', color: 'var(--primary-700)' };
      default: return { bg: 'var(--warning-100)', color: 'var(--warning-600)' };
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'High': return { bg: 'var(--danger-100)', color: 'var(--danger-600)' };
      case 'Medium': return { bg: 'var(--warning-100)', color: 'var(--warning-600)' };
      default: return { bg: 'var(--success-100)', color: 'var(--success-600)' };
    }
  };

  return (
    <div className="search-page">
      <style jsx>{`
        .search-page { animation: fadeIn 0.5s ease-out; }
        .page-header { margin-bottom: 2rem; animation: fadeInUp 0.5s ease-out; }
        .page-header h1 { font-size: 1.875rem; font-weight: 700; color: var(--foreground); margin-bottom: 0.5rem; }
        .page-header p { color: var(--foreground-secondary); font-size: 0.9375rem; }
        .search-section { background: var(--background-secondary); border-radius: 16px; border: 1px solid var(--border-color); padding: 1.5rem; margin-bottom: 1.5rem; animation: fadeInUp 0.5s ease-out 0.1s backwards; }
        .search-bar { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; }
        .search-input-wrapper { flex: 1; position: relative; }
        .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--gray-400); pointer-events: none; }
        .search-input { width: 100%; padding: 0.875rem 1rem 0.875rem 2.75rem; font-size: 0.9375rem; background: var(--background); border: 2px solid var(--border-color); border-radius: 12px; color: var(--foreground); transition: all 0.2s; }
        .search-input:focus { outline: none; border-color: var(--primary-500); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
        .search-input::placeholder { color: var(--gray-400); }
        .search-btn { padding: 0.875rem 1.75rem; font-size: 0.9375rem; font-weight: 600; color: white; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; border-radius: 12px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3); display: flex; align-items: center; gap: 0.5rem; }
        .search-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4); }
        .advanced-filters { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; padding-top: 1.25rem; border-top: 1px solid var(--border-color); }
        .filter-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .filter-label { font-size: 0.75rem; font-weight: 600; color: var(--foreground-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
        .filter-select, .filter-input { padding: 0.75rem 1rem; font-size: 0.9375rem; background: var(--background); border: 2px solid var(--border-color); border-radius: 10px; color: var(--foreground); transition: all 0.2s; width: 100%; }
        .filter-select:focus, .filter-input:focus { outline: none; border-color: var(--primary-500); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
        .quick-filters-section { margin-bottom: 1.5rem; animation: fadeInUp 0.5s ease-out 0.13s backwards; }
        .quick-filters-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--foreground-secondary); margin-bottom: 0.75rem; }
        .quick-filters { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .quick-chip { padding: 0.5rem 1rem; background: var(--background-secondary); border: 2px solid var(--border-color); border-radius: 10px; font-size: 0.8125rem; font-weight: 600; color: var(--foreground); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.375rem; }
        .quick-chip:hover { border-color: var(--primary-300); transform: translateY(-1px); }
        .saved-section { margin-bottom: 1.5rem; animation: fadeInUp 0.5s ease-out 0.16s backwards; }
        .saved-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
        .saved-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--foreground-secondary); }
        .saved-searches { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .saved-chip { padding: 0.5rem 1rem; background: var(--primary-50); border: 2px solid var(--primary-200); border-radius: 10px; font-size: 0.8125rem; font-weight: 600; color: var(--primary-700); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; }
        .saved-chip:hover { border-color: var(--primary-400); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.15); }
        .saved-chip-del { background: none; border: none; color: var(--primary-400); cursor: pointer; font-size: 0.875rem; line-height: 1; padding: 0 0 0 0.25rem; }
        .saved-chip-del:hover { color: var(--danger-600); }
        .results-container { animation: fadeInUp 0.5s ease-out 0.2s backwards; }
        .results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
        .results-title { font-size: 1.125rem; font-weight: 700; color: var(--foreground); display: flex; align-items: center; gap: 0.5rem; }
        .results-count { font-size: 0.875rem; color: var(--foreground-secondary); }
        .result-card { background: var(--background-secondary); border: 1px solid var(--border-color); border-radius: 14px; padding: 1.25rem; margin-bottom: 1rem; transition: all 0.3s ease; animation: fadeInUp 0.4s ease-out backwards; text-decoration: none; display: block; color: inherit; }
        .result-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1); border-color: var(--primary-300); }
        .result-header { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 0.75rem; }
        .result-icon { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 1.125rem; flex-shrink: 0; }
        .result-content { flex: 1; min-width: 0; }
        .result-title { font-size: 1rem; font-weight: 600; color: var(--foreground); margin-bottom: 0.5rem; line-height: 1.4; }
        .result-description { font-size: 0.875rem; color: var(--foreground-secondary); line-height: 1.5; margin-bottom: 0.75rem; }
        .result-meta { display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; }
        .meta-item { display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; color: var(--foreground-secondary); }
        .meta-project { font-weight: 600; color: var(--primary-600); }
        .result-footer { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color); margin-top: 0.75rem; }
        .result-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .badge { padding: 0.375rem 0.75rem; border-radius: 8px; font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .search-bar { flex-direction: column; }
          .advanced-filters { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page-header">
        <h1>Task Search & Filters</h1>
        <p>Find tasks quickly with advanced search and filtering options.</p>
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks by title, description, or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="search-btn" disabled={isLoading}>
            <span>{isLoading ? 'Searching...' : 'Search'}</span>
          </button>
        </form>

        <div className="advanced-filters">
          <div className="filter-group">
            <label className="filter-label">Priority</label>
            <select className="filter-select" value={priorityFilter} onChange={(e) => { const v = e.target.value; setPriorityFilter(v); handleSearch(undefined, { priority: v, status: statusFilter, query: searchQuery, assignee: assigneeFilter, dueDateFrom, dueDateTo }); }}>
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select className="filter-select" value={statusFilter} onChange={(e) => { const v = e.target.value; setStatusFilter(v); handleSearch(undefined, { status: v, priority: priorityFilter, query: searchQuery, assignee: assigneeFilter, dueDateFrom, dueDateTo }); }}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          {users.length > 0 && (
            <div className="filter-group">
              <label className="filter-label">Assignee</label>
              <select className="filter-select" value={assigneeFilter} onChange={(e) => { const v = e.target.value; setAssigneeFilter(v); handleSearch(undefined, { assignee: v, status: statusFilter, priority: priorityFilter, query: searchQuery, dueDateFrom, dueDateTo }); }}>
                <option value="">All Assignees</option>
                {users.map(u => (
                  <option key={u.userId} value={String(u.userId)}>{u.username}</option>
                ))}
              </select>
            </div>
          )}
          <div className="filter-group">
            <label className="filter-label">Due From</label>
            <input type="date" className="filter-input" value={dueDateFrom} onChange={e => { const v = e.target.value; setDueDateFrom(v); handleSearch(undefined, { dueDateFrom: v, dueDateTo, assignee: assigneeFilter, status: statusFilter, priority: priorityFilter, query: searchQuery }); }} />
          </div>
          <div className="filter-group">
            <label className="filter-label">Due To</label>
            <input type="date" className="filter-input" value={dueDateTo} onChange={e => { const v = e.target.value; setDueDateTo(v); handleSearch(undefined, { dueDateTo: v, dueDateFrom, assignee: assigneeFilter, status: statusFilter, priority: priorityFilter, query: searchQuery }); }} />
          </div>
        </div>
      </div>

      <div className="quick-filters-section">
        <div className="quick-filters-label">Quick Filters</div>
        <div className="quick-filters">
          <button className="quick-chip" type="button" onClick={() => applyQuickFilter({ priority: 'High' })}>⭐ High Priority</button>
          <button className="quick-chip" type="button" onClick={() => applyQuickFilter({ status: 'In Progress' })}>⏳ In Progress</button>
          <button className="quick-chip" type="button" onClick={() => applyQuickFilter({ status: 'Pending' })}>📋 Pending</button>
          <button className="quick-chip" type="button" onClick={() => applyQuickFilter({ status: 'Completed' })}>✅ Completed</button>
        </div>
      </div>

      <div className="saved-section">
        <div className="saved-header">
          <div className="saved-label">💾 Saved Searches</div>
        </div>
        {savedSearches.length > 0 ? (
          <div className="saved-searches">
            {savedSearches.map(ss => (
              <div key={ss.id} className="saved-chip" onClick={() => applySavedSearch(ss)}>
                🔖 {ss.label}
                <button className="saved-chip-del" onClick={e => { e.stopPropagation(); deleteSavedSearch(ss.id); }}>✕</button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '0.875rem', color: 'var(--foreground-secondary)' }}>No saved searches yet. Run any search and it will be saved automatically.</div>
        )}
      </div>

      <div className="results-container">
        <div className="results-header">
          <div className="results-title"><span>📋</span> Search Results</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="results-count">{results.length} results found</span>
          </div>
        </div>

        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--primary-500)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        )}

        {!isLoading && hasSearched && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--foreground-secondary)' }}>
            No results found
          </div>
        )}

        {!isLoading && !hasSearched && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--foreground-secondary)' }}>
            Enter a search query or apply a filter to find tasks
          </div>
        )}

        {results.map((result, i) => {
          const statusStyle = getStatusStyle(result.status);
          const priorityStyle = getPriorityStyle(result.priority);

          return (
            <Link href={`/tasks/${result.id}`} key={result.id} className="result-card" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="result-header">
                <div className="result-icon">📋</div>
                <div className="result-content">
                  <div className="result-title">{result.title}</div>
                  <div className="result-description">{result.description || 'No description'}</div>
                  <div className="result-meta">
                    <div className="meta-item"><span>📁</span><span className="meta-project">{result.project?.name || 'No Project'}</span></div>
                    <div className="meta-item"><span>👤</span><span>{result.assignee?.name || 'Unassigned'}</span></div>
                    {result.dueDate && (
                      <div className="meta-item"><span>📅</span><span>Due: {new Date(result.dueDate).toLocaleDateString()}</span></div>
                    )}
                  </div>
                </div>
              </div>
              <div className="result-footer">
                <div className="result-badges">
                  <span className="badge" style={{ background: statusStyle.bg, color: statusStyle.color }}>{result.status}</span>
                  <span className="badge" style={{ background: priorityStyle.bg, color: priorityStyle.color }}>{result.priority}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
