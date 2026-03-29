'use client';
import MemoryPanel from './MemoryPanel';

export default function Sidebar({ chats, activeChatId, onSelectChat, onNewChat, section, onSectionChange }) {
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
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid #e8e8e8' }}>
        <div style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px', color: '#1a1a1a' }}>
          Hyzen
        </div>
        <div style={{ fontSize: '11px', color: '#a0a0a0', marginTop: '2px' }}>Personal AI</div>
      </div>

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: '4px', padding: '10px', borderBottom: '1px solid #e8e8e8' }}>
        {['chats', 'memories'].map(s => (
          <button
            key={s}
            onClick={() => onSectionChange(s)}
            style={{
              flex: 1, padding: '7px', border: 'none', borderRadius: '8px',
              backgroundColor: section === s ? '#fff' : 'transparent',
              boxShadow: section === s ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              fontSize: '13px', fontWeight: '500',
              color: section === s ? '#1a1a1a' : '#6b6b6b',
              textTransform: 'capitalize',
              transition: 'all 0.15s',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {section === 'chats' ? (
          <>
            <button
              onClick={onNewChat}
              style={{
                width: '100%', padding: '9px 12px', marginBottom: '6px',
                backgroundColor: '#2563eb', color: '#fff', border: 'none',
                borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                transition: 'background-color 0.15s',
              }}
            >
              + New Chat
            </button>

            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                title={chat.name}
                style={{
                  width: '100%', padding: '9px 12px', marginBottom: '2px',
                  backgroundColor: chat.id === activeChatId ? '#e8e8ec' : 'transparent',
                  border: 'none', borderRadius: '8px',
                  textAlign: 'left', fontSize: '13px', color: '#1a1a1a',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  transition: 'background-color 0.1s',
                }}
              >
                {chat.name}
              </button>
            ))}
          </>
        ) : (
          <MemoryPanel />
        )}
      </div>
    </aside>
  );
}
