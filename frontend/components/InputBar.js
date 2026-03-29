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
      padding: '12px 24px 20px',
      backgroundColor: '#fff',
      flexShrink: 0,
    }}>
      <div style={{
        maxWidth: '760px',
        margin: '0 auto',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-end',
        backgroundColor: '#fff',
        border: '1.5px solid #e0e0e0',
        borderRadius: '16px',
        padding: '10px 12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
        onFocusCapture={e => {
          e.currentTarget.style.borderColor = '#2563eb';
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(37,99,235,0.12)';
        }}
        onBlurCapture={e => {
          e.currentTarget.style.borderColor = '#e0e0e0';
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)';
        }}
      >
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={e => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
          }}
          placeholder="Message Hyzen..."
          disabled={isLoading}
          rows={1}
          style={{
            flex: 1,
            border: 'none',
            padding: '2px 4px',
            fontSize: '15px',
            lineHeight: '1.6',
            resize: 'none',
            minHeight: '28px',
            maxHeight: '160px',
            backgroundColor: 'transparent',
            color: '#1a1a1a',
            boxShadow: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            width: '36px',
            height: '36px',
            flexShrink: 0,
            borderRadius: '10px',
            border: 'none',
            backgroundColor: canSend ? '#2563eb' : '#ebebeb',
            color: canSend ? '#fff' : '#b0b0b0',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.15s',
          }}
        >
          ↑
        </button>
      </div>
      <div style={{ maxWidth: '760px', margin: '7px auto 0', textAlign: 'center' }}>
        <span style={{ fontSize: '11px', color: '#d0d0d0' }}>
          Enter to send · Shift+Enter for new line
        </span>
      </div>
    </div>
  );
}

