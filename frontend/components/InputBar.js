'use client';
import { useState } from 'react';

export default function InputBar({ onSend, isLoading }) {
  const [value, setValue] = useState('');

  function handleSend() {
    const text = value.trim();
    if (!text || isLoading) return;
    onSend(text);
    setValue('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const canSend = value.trim().length > 0 && !isLoading;

  return (
    <div style={{
      borderTop: '1px solid #e8e8e8',
      padding: '14px 24px 18px',
      backgroundColor: '#fff',
      flexShrink: 0,
    }}>
      <div style={{
        maxWidth: '720px',
        margin: '0 auto',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-end',
      }}>
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={e => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
          }}
          placeholder="Message Hyzen…"
          disabled={isLoading}
          rows={1}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid #e0e0e0',
            borderRadius: '14px',
            fontSize: '14px',
            lineHeight: '1.5',
            resize: 'none',
            minHeight: '48px',
            maxHeight: '160px',
            backgroundColor: '#fafafa',
            color: '#1a1a1a',
            transition: 'border-color 0.15s',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            width: '44px',
            height: '44px',
            flexShrink: 0,
            borderRadius: '12px',
            border: 'none',
            backgroundColor: canSend ? '#2563eb' : '#e0e0e0',
            color: canSend ? '#fff' : '#a0a0a0',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.15s',
          }}
        >
          ↑
        </button>
      </div>
      <div style={{ maxWidth: '720px', margin: '6px auto 0', textAlign: 'center' }}>
        <span style={{ fontSize: '11px', color: '#c8c8c8' }}>
          Enter to send · Shift+Enter for new line
        </span>
      </div>
    </div>
  );
}
