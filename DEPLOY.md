# Hyzen AI — Deployment Guide

---

## SECTION A — FIRST TIME SETUP (VPS)

Run these once on a fresh VPS, top to bottom.

---

### A1. Install Node.js and PM2

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
sudo npm install -g pm2
```

---

### A2. Clone the Repo

```bash
cd /home/ubuntu
git clone https://github.com/abhinavsinghyeah-lgtm/hyzenai hyzen-ai
```

---

### A3. Set Up Backend

```bash
cd /home/ubuntu/hyzen-ai
npm install --omit=dev
cp .env.example .env
nano .env
```

Paste this inside nano, fill in your keys, then `Ctrl+O` → `Enter` → `Ctrl+X`:

```
GROQ_API_KEY=gsk_your_actual_key_here
GROQ_MODEL=llama-3.3-70b-versatile
PORT=3000
OPENAI_API_KEY=sk-your-openai-key-here
KEYWORD_WEIGHT=0.5
SEMANTIC_WEIGHT=0.5
DEBUG=false
```

---

### A4. Start Backend

```bash
pm2 start index.js --name hyzen-ai
pm2 save
pm2 startup
```

> Copy and run the command that `pm2 startup` prints.

Test it:

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

---

### A5. Set Up Frontend

```bash
cd /home/ubuntu/hyzen-ai/frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://18.232.64.195:3000" > .env.local
npm run build
```

> Build must print `Compiled successfully` before continuing.

```bash
pm2 start npm --name hyzen-ai-frontend --cwd /home/ubuntu/hyzen-ai/frontend -- run start
pm2 save
pm2 status
```

> Both `hyzen-ai` and `hyzen-ai-frontend` must show `online`.

```bash
curl -I http://localhost:4000
```

> Must return `HTTP/1.1 200 OK`. App is at `http://18.232.64.195:4000`

---

---

## SECTION B — EVERY FUTURE UPDATE

**Windows — push code:**

```powershell
cd "r:\Hyzen AI"
git add .
git commit -m "update"
git push
```

**VPS — backend update:**

```bash
cd /home/ubuntu/hyzen-ai && git pull
npm install --omit=dev
pm2 restart hyzen-ai
```

**VPS — frontend update:**

```bash
cd /home/ubuntu/hyzen-ai && git pull
cd /home/ubuntu/hyzen-ai/frontend && npm install
npm run build
pm2 restart hyzen-ai-frontend
```

**VPS — backend personality update (restarts to reload personality.txt):**

```bash
cd /home/ubuntu/hyzen-ai && git pull && pm2 restart hyzen-ai
```

---

---

## SECTION C — FIX: FRONTEND NOT WORKING

**Run every command in order, one at a time.**

---

### C1. Stop the broken process

```bash
pm2 delete hyzen-ai-frontend
```

---

### C2. Pull latest code

```bash
cd /home/ubuntu/hyzen-ai && git pull
```

---

### C3. Verify jsconfig.json exists

```bash
cat /home/ubuntu/hyzen-ai/frontend/jsconfig.json
```

Expected output — must see this or re-run C2:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

### C4. Wipe all caches

```bash
rm -rf /home/ubuntu/hyzen-ai/frontend/.next
rm -rf /home/ubuntu/hyzen-ai/frontend/node_modules
```

---

### C5. Reinstall dependencies

```bash
cd /home/ubuntu/hyzen-ai/frontend && npm install
```

---

### C6. Write .env.local

```bash
echo "NEXT_PUBLIC_API_URL=http://18.232.64.195:3000" > /home/ubuntu/hyzen-ai/frontend/.env.local
```

---

### C7. Build

```bash
cd /home/ubuntu/hyzen-ai/frontend && npm run build
```

> Must end with `Compiled successfully`. If it errors, paste the error.

---

### C8. Start with correct working directory

```bash
pm2 start npm --name hyzen-ai-frontend --cwd /home/ubuntu/hyzen-ai/frontend -- run start
pm2 save
```

---

### C9. Confirm everything is online

```bash
pm2 status
```

> Both `hyzen-ai` and `hyzen-ai-frontend` must show `online`.

---

### C10. Test frontend is reachable

```bash
curl -I http://localhost:4000
```

> Must return `HTTP/1.1 200 OK`
> App is live at: http://18.232.64.195:4000

---

---

## SECTION D — USEFUL COMMANDS

```bash
pm2 status
pm2 logs hyzen-ai --lines 50
pm2 logs hyzen-ai-frontend --lines 50
pm2 restart hyzen-ai
pm2 restart hyzen-ai-frontend
curl http://localhost:3000/health
curl -I http://localhost:4000
cat /home/ubuntu/hyzen-ai/.env
cat /home/ubuntu/hyzen-ai/frontend/.env.local
```

---

---

## SECTION E — TEST ALL BACKEND ENDPOINTS

```bash
curl http://localhost:3000/health

curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "session_id": "test1"}'

curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What did I just say?", "session_id": "test1"}'

curl http://localhost:3000/memory

curl http://localhost:3000/personality
```
