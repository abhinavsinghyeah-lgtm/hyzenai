'use client';
import { useState, useEffect } from 'react';
import * as api from '@/lib/api';

export default function MemoryPanel() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getMemories();
      setMemories(data.memories || []);
    } catch {
      setError('Failed to load memories');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this memory?')) return;
    try {
      await api.deleteMemory(id);
      setMemories(prev => prev.filter(m => m.id !== id));
    } catch {
      alert('Failed to delete memory');
    }
  }

  function startEdit(mem) {
    setEditingId(mem.id);
    setEditData({ summary: mem.summary, importance: mem.importance, type: mem.type });
  }

  async function handleSave(id) {
    try {
      await api.patchMemory(id, {
        summary: editData.summary,
        importance: Math.min(10, Math.max(1, parseInt(editData.importance) || 5)),
        type: editData.type,
      });
      setMemories(prev => prev.map(m =>
        m.id === id
          ? { ...m, summary: editData.summary, importance: parseInt(editData.importance), type: editData.type }
          : m
      ));
      setEditingId(null);
    } catch {
      alert('Failed to save changes');
    }
  }

  if (loading) return (
    <div style={{ padding: '24px 0', textAlign: 'center', color: '#a0a0a0', fontSize: '13px' }}>
      Loading memories…
    </div>
  );

  if (error) return (
    <div style={{ padding: '12px' }}>
      <div style={{ fontSize: '13px', color: '#e53e3e', marginBottom: '8px' }}>{error}</div>
      <button onClick={load} style={{ fontSize: '12px', color: '#2563eb', background: 'none', border: 'none' }}>
        Retry
      </button>
    </div>
  );

  if (!memories.length) return (
    <div style={{ padding: '32px 8px', textAlign: 'center', color: '#a0a0a0', fontSize: '13px', lineHeight: '1.6' }}>
      No memories yet.<br />Start chatting to create some.
    </div>
  );

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 4px 8px', marginBottom: '2px' }}>
        <span style={{ fontSize: '11px', fontWeight: '600', color: '#a0a0a0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {memories.length} saved
        </span>
        <button onClick={load} style={{ fontSize: '11px', color: '#2563eb', background: 'none', border: 'none' }}>
          Refresh
        </button>
      </div>

      {memories.map(mem => (
        <div key={mem.id} style={{
          backgroundColor: '#fff',
          borderRadius: '10px',
          padding: '12px',
          marginBottom: '8px',
          border: '1px solid #efefef',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          {editingId === mem.id ? (
            /* Edit mode */
            <div>
              <textarea
                value={editData.summary}
                onChange={e => setEditData(p => ({ ...p, summary: e.target.value }))}
                style={{
                  width: '100%', padding: '7px 9px', marginBottom: '7px',
                  border: '1px solid #e0e0e0', borderRadius: '7px',
                  fontSize: '12px', resize: 'none', minHeight: '64px', lineHeight: '1.5',
                  background: '#fafafa',
                }}
              />
              <div style={{ display: 'flex', gap: '6px', marginBottom: '7px' }}>
                <select
                  value={editData.type}
                  onChange={e => setEditData(p => ({ ...p, type: e.target.value }))}
                  style={{ flex: 1, padding: '5px 8px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', background: '#fff', color: '#1a1a1a' }}
                >
                  <option value="fact">fact</option>
                  <option value="personal">personal</option>
                </select>
                <input
                  type="number" min={1} max={10}
                  value={editData.importance}
                  onChange={e => setEditData(p => ({ ...p, importance: e.target.value }))}
                  style={{ width: '52px', padding: '5px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', textAlign: 'center' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleSave(mem.id)} style={{
                  flex: 1, padding: '7px', backgroundColor: '#2563eb', color: '#fff',
                  border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '600',
                }}>
                  Save
                </button>
                <button onClick={() => setEditingId(null)} style={{
                  flex: 1, padding: '7px', backgroundColor: '#f0f0f0',
                  border: 'none', borderRadius: '7px', fontSize: '12px', color: '#1a1a1a',
                }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* View mode */
            <>
              <p style={{ fontSize: '12px', lineHeight: '1.55', color: '#2a2a2a', marginBottom: '10px' }}>
                {mem.summary}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: '600', padding: '2px 7px', borderRadius: '4px',
                    backgroundColor: mem.type === 'personal' ? '#fef3c7' : '#eff6ff',
                    color: mem.type === 'personal' ? '#92400e' : '#1d4ed8',
                  }}>
                    {mem.type}
                  </span>
                  <span style={{ fontSize: '11px', color: '#a0a0a0' }}>·</span>
                  <span style={{ fontSize: '11px', color: '#a0a0a0' }}>{mem.importance}/10</span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => startEdit(mem)} style={{
                    fontSize: '11px', color: '#6b6b6b', background: 'none',
                    border: '1px solid #e8e8e8', borderRadius: '5px', padding: '3px 8px',
                  }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(mem.id)} style={{
                    fontSize: '11px', color: '#e53e3e', background: 'none',
                    border: '1px solid #fecaca', borderRadius: '5px', padding: '3px 8px',
                  }}>
                    Del
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
