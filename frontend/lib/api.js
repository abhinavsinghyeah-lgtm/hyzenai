const BASE = () =>
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function sendMessage(message, sessionId) {
  const res = await fetch(`${BASE()}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id: sessionId }),
  });
  if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
  return res.json();
}

export async function getMemories() {
  const res = await fetch(`${BASE()}/memory`);
  if (!res.ok) throw new Error(`Memories failed: ${res.status}`);
  return res.json();
}

export async function patchMemory(id, data) {
  const res = await fetch(`${BASE()}/memory/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Update failed: ${res.status}`);
  return res.json();
}

export async function deleteMemory(id) {
  const res = await fetch(`${BASE()}/memory/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
  return res.json();
}
