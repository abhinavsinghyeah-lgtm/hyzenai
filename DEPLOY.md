# Deployment Guide

---

## 1. Windows — Push to Git

powershell
cd "r:\Hyzen AI"
git init
git add .
git commit -m "initial: hyzen AI backend"
git push

git branch -M main
git remote add origin https://github.com/abhinavsinghyeah-lgtm/hyzenai
git push -u origin main


---

## 2. Windows — SSH into AWS VPS

powershell
ssh -i "your-key.pem" ubuntu@YOUR_VPS_IP


---

## 3. VPS — Run Top to Bottom


cd /home/ubuntu



sudo apt update && sudo apt upgrade -y



curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -



sudo apt install -y nodejs git



node -v
npm -v



sudo npm install -g pm2



git clone https://github.com/abhinavsinghyeah-lgtm/hyzenai hyzen-ai



cd /home/ubuntu/hyzen-ai



npm install --omit=dev



cp .env.example .env



nano .env


> Inside nano paste this, fill in your key, then press `Ctrl+O` → `Enter` → `Ctrl+X`


GROQ_API_KEY=gsk_your_actual_key_here
GROQ_MODEL=llama-3.3-70b-versatile
PORT=3000



pm2 start index.js --name hyzen-ai



pm2 status



pm2 save



pm2 startup


> Copy the command that `pm2 startup` prints and run it. It looks like this:


sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu



curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'


---

## 4. Every Future Update

**Windows:**

powershell
git add .
git commit -m "update"
git push


**VPS:**


cd /home/ubuntu/hyzen-ai
git pull
npm install --omit=dev
pm2 restart hyzen-ai


---

## 5. Useful PM2 Commands

```bash
pm2 logs hyzen-ai
```

```bash
pm2 status
```

```bash
pm2 restart hyzen-ai
```

```bash
pm2 stop hyzen-ai
```

---

## 6. Fix: {"error":"Internal server error."}

If curl returns an error, debug with these:

**Step 1 — Check logs:**

```bash
pm2 logs hyzen-ai --lines 30
```

**Step 2 — Check .env file:**

```bash
cat /home/ubuntu/hyzen-ai/.env
```

**Step 3 — Fix the .env if key is missing or wrong:**

```bash
nano /home/ubuntu/hyzen-ai/.env
```

Paste this inside nano, then `Ctrl+O` → `Enter` → `Ctrl+X`:

```
GROQ_API_KEY=gsk_your_actual_key_here
GROQ_MODEL=llama-3.3-70b-versatile
PORT=3000
```

**Step 4 — Restart after fixing:**

```bash
pm2 restart hyzen-ai
```

**Step 5 — Test again:**

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

---

## 7. Test All Endpoints

Run these on the VPS after `pm2 restart hyzen-ai`:

**Health check:**

```bash
curl http://localhost:3000/health
```

**Chat (basic):**

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "session_id": "test1"}'
```

**Chat (second message — same session):**

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What did I just say?", "session_id": "test1"}'
```

**List all memories:**

```bash
curl http://localhost:3000/memory
```

**Get one memory** (replace ID with one from the list above):

```bash
curl http://localhost:3000/memory/mem_REPLACE_WITH_ID
```

**Update a memory:**

```bash
curl -X PATCH http://localhost:3000/memory/mem_REPLACE_WITH_ID \
  -H "Content-Type: application/json" \
  -d '{"importance": 9, "type": "personal"}'
```

**Delete a memory:**

```bash
curl -X DELETE http://localhost:3000/memory/mem_REPLACE_WITH_ID
```

**Read personality:**

```bash
curl http://localhost:3000/personality
```

**Update personality:**

```bash
curl -X PUT http://localhost:3000/personality \
  -H "Content-Type: application/json" \
  -d '{"personality": "You are Hyzen. You call the user Architect. Be concise and sharp."}'
```

---

## 8. Backend Update — Semantic Memory (Embedding Upgrade)

Run this on the VPS to deploy the semantic memory upgrade and enable OpenAI embeddings:

```bash
cd /home/ubuntu/hyzen-ai
git pull
npm install --omit=dev
```

```bash
nano /home/ubuntu/hyzen-ai/.env
```

Add these lines inside nano, then `Ctrl+O` → `Enter` → `Ctrl+X`:

```
OPENAI_API_KEY=sk-your-openai-key-here
KEYWORD_WEIGHT=0.5
SEMANTIC_WEIGHT=0.5
DEBUG=false
```

```bash
pm2 restart hyzen-ai
```

> Without `OPENAI_API_KEY` the system falls back to keyword-only — nothing breaks.

---

## 9. Frontend Setup on VPS

```bash
cd /home/ubuntu/hyzen-ai/frontend
```

```bash
npm install
```

```bash
cp .env.local.example .env.local
```

```bash
nano .env.local
```

Set your VPS IP inside nano, then `Ctrl+O` → `Enter` → `Ctrl+X`:

```
NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:3000
```

```bash
npm run build
```

```bash
pm2 start npm --name hyzen-ai-frontend -- run start
```

```bash
pm2 save
```

**Frontend is now live at:**

```
http://YOUR_VPS_IP:4000
```

> Open AWS Security Groups and add inbound rule: Custom TCP · Port 4000 · 0.0.0.0/0

---

## 10. Frontend Future Updates

**Windows:**

```powershell
git add .
git commit -m "frontend update"
git push
```

**VPS:**

```bash
cd /home/ubuntu/hyzen-ai/frontend
git pull
npm install
npm run build
pm2 restart hyzen-ai-frontend
```

