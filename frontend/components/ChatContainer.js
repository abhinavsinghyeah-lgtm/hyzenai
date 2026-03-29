'use client';
import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

export default function ChatContainer({ messages, isLoading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0 8px',
    }}>
      {/* Empty state */}
      {messages.length === 0 && !isLoading && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#c8c8c8',
          userSelect: 'none',
          gap: '10px',
        }}>
          <div style={{ fontSize: '40px', fontWeight: '700', letterSpacing: '-1.5px', color: '#d8d8d8' }}>
            Hyzen
          </div>
          <div style={{ fontSize: '15px', color: '#c0c0c0' }}>How can I help, Architect?</div>
        </div>
      )}

      {/* Messages */}
      {messages.map((msg, i) => (
        <MessageBubble key={i} message={msg} />
      ))}

      {/* Thinking indicator */}
      {isLoading && (
        <div style={{ padding: '8px 24px', maxWidth: '760px', width: '100%', margin: '0 auto', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{
            display: 'inline-flex', gap: '6px', alignItems: 'center',
            backgroundColor: '#f4f4f5',
            border: '1px solid #ebebeb',
            padding: '11px 16px', borderRadius: '18px 18px 18px 4px',
          }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#b0b0b0',
                animation: `dotPulse 1.4s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
            <span style={{ fontSize: '13px', color: '#a0a0a0', marginLeft: '4px' }}>Hyzen is thinking…</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} style={{ paddingBottom: '8px' }} />
    </div>
  );
}
