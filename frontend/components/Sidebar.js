'use client';
import { useState } from 'react';
import MemoryPanel from './MemoryPanel';

export default function Sidebar({ chats, activeChatId, onSelectChat, onNewChat, section, onSectionChange }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <aside style={{
      width: '272px',
      flexShrink: 0,
      backgroundColor: '#f7f7f8',
      borderRight: '1px solid #e8e8e8',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Brand */}
      <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid #e8e8e8' }}>
        <div style={{ fontSize: '21px', fontWeight: '700', letterSpacing: '-0.5px', color: '#111' }}>
          Hyzen
        </div>
        <div style={{ fontSize: '11px', color: '#b0b0b0', marginTop: '3px', letterSpacing: '0.2px' }}>Personal AI</div>
      </div>

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: '4px', padding: '10px', borderBottom: '1px solid #e8e8e8' }}>
        {['chats', 'memories'].map(s => (
          <button
            key={s}
            onClick={() => onSectionChange(s)}
            style={{
              flex: 1, padding: '8px', border: 'none', borderRadius: '8px',
              backgroundColor: section === s ? '#fff' : 'transparent',
              boxShadow: section === s ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
              fontSize: '13px', fontWeight: section === s ? '600' : '500',
              color: section === s ? '#111' : '#888',
              textTransform: 'capitalize',
              transition: 'all 0.15s',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
        {section === 'chats' ? (
          <>
            <button
              onClick={onNewChat}
              style={{
                width: '100%', padding: '10px 12px', marginBottom: '8px',
                backgroundColor: '#2563eb', color: '#fff', border: 'none',
                borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                letterSpacing: '0.1px',
                transition: 'background-color 0.15s, opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              + New Chat
            </button>

            {chats.map(chat => {
              const isActive = chat.id === activeChatId;
              const isHovered = hoveredId === chat.id;
              return (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  onMouseEnter={() => setHoveredId(chat.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  title={chat.name}
                  style={{
                    width: '100%', padding: '10px 12px', marginBottom: '2px',
                    backgroundColor: isActive ? '#ebebf0' : isHovered ? '#f0f0f3' : 'transparent',
                    border: 'none',
                    borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent',
                    borderRadius: '8px',
                    textAlign: 'left', fontSize: '13px',
                    color: isActive ? '#111' : '#444',
                    fontWeight: isActive ? '600' : '400',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    transition: 'background-color 0.1s, border-color 0.1s',
                  }}
                >
                  {chat.name}
                </button>
              );
            })}
          </>
        ) : (
          <MemoryPanel />
        )}
      </div>
    </aside>
  );
}

