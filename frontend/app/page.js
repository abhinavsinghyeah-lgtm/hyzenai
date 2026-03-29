'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatContainer from '@/components/ChatContainer';
import InputBar from '@/components/InputBar';
import * as api from '@/lib/api';

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function Home() {
  const [ready, setReady] = useState(false);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState('');
  const [section, setSection] = useState('chats');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize on client only to avoid SSR hydration mismatch with random IDs
  useEffect(() => {
    const id = uid();
    setChats([{ id, name: 'New Chat', messages: [] }]);
    setActiveChatId(id);
    setReady(true);
  }, []);

  const activeChat = chats.find(c => c.id === activeChatId);

  function updateChat(id, updater) {
    setChats(prev => prev.map(c => c.id === id ? { ...c, ...updater(c) } : c));
  }

  function createNewChat() {
    const id = uid();
    setChats(prev => [{ id, name: 'New Chat', messages: [] }, ...prev]);
    setActiveChatId(id);
    setSection('chats');
  }

  async function handleSend(message) {
    if (!message || isLoading || !activeChatId) return;

    // Auto-name from first message
    if (activeChat?.messages.length === 0) {
      updateChat(activeChatId, () => ({
        name: message.slice(0, 30) + (message.length > 30 ? '…' : ''),
      }));
    }

    // Append user message immediately
    updateChat(activeChatId, c => ({
      messages: [...c.messages, { role: 'user', content: message }],
    }));

    setIsLoading(true);

    try {
      const data = await api.sendMessage(message, activeChatId);
      updateChat(activeChatId, c => ({
        messages: [...c.messages, { role: 'assistant', content: data.reply }],
      }));
    } catch {
      updateChat(activeChatId, c => ({
        messages: [...c.messages, {
          role: 'assistant',
          content: 'Something went wrong connecting to the server. Please try again.',
        }],
      }));
    } finally {
      setIsLoading(false);
    }
  }

  if (!ready) {
    return (
      <div style={{
        display: 'flex', height: '100vh',
        alignItems: 'center', justifyContent: 'center',
        color: '#a0a0a0', fontSize: '14px',
      }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#fff' }}>
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={id => { setActiveChatId(id); setSection('chats'); }}
        onNewChat={createNewChat}
        section={section}
        onSectionChange={setSection}
      />

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Chat header */}
        <div style={{
          padding: '15px 24px',
          borderBottom: '1px solid #e8e8e8',
          backgroundColor: '#fff',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a' }}>
            {activeChat?.name || 'New Chat'}
          </div>
          {isLoading && (
            <span style={{
              fontSize: '11px', color: '#a0a0a0',
              backgroundColor: '#f4f4f4', padding: '2px 8px', borderRadius: '10px',
            }}>
              thinking…
            </span>
          )}
        </div>

        <ChatContainer messages={activeChat?.messages || []} isLoading={isLoading} />
        <InputBar onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
