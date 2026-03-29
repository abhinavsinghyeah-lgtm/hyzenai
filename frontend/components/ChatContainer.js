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
      padding: '16px 0',
    }}>
      {/* Empty state */}
      {messages.length === 0 && !isLoading && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#c0c0c0',
          userSelect: 'none',
        }}>
          <div style={{ fontSize: '36px', fontWeight: '700', letterSpacing: '-1px', marginBottom: '8px' }}>
            Hyzen
          </div>
          <div style={{ fontSize: '14px' }}>How can I help you today, Architect?</div>
        </div>
      )}

      {/* Messages */}
      {messages.map((msg, i) => (
        <MessageBubble key={i} message={msg} />
      ))}

      {/* Loading dots */}
      {isLoading && (
        <div style={{ padding: '6px 24px', maxWidth: '720px', width: '100%', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', gap: '5px', alignItems: 'center',
            backgroundColor: '#f0f0f0', padding: '12px 16px', borderRadius: '18px',
          }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#a0a0a0',
                animation: `dotPulse 1.4s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
