'use client';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      padding: '6px 24px',
      maxWidth: '760px',
      width: '100%',
      margin: '0 auto',
      animation: 'fadeIn 0.22s ease-out',
    }}>
      <div style={{
        maxWidth: '74%',
        padding: '12px 18px',
        borderRadius: isUser ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
        backgroundColor: isUser ? '#2563eb' : '#f4f4f5',
        color: isUser ? '#fff' : '#1a1a1a',
        fontSize: '15px',
        lineHeight: '1.7',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        border: isUser ? 'none' : '1px solid #ebebeb',
        boxShadow: isUser
          ? '0 2px 8px rgba(37,99,235,0.18)'
          : '0 1px 3px rgba(0,0,0,0.05)',
        letterSpacing: '0.01em',
      }}>
        {message.content}
      </div>
    </div>
  );
}
