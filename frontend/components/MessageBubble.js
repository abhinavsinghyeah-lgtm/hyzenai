'use client';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      padding: '4px 24px',
      maxWidth: '720px',
      width: '100%',
      margin: '0 auto',
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <div style={{
        maxWidth: '72%',
        padding: '11px 16px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        backgroundColor: isUser ? '#2563eb' : '#f0f0f0',
        color: isUser ? '#fff' : '#1a1a1a',
        fontSize: '14px',
        lineHeight: '1.65',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}>
        {message.content}
      </div>
    </div>
  );
}
