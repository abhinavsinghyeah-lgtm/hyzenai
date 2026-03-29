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

pm2 logs hyzen-ai

pm2 status

pm2 restart hyzen-ai

pm2 stop hyzen-ai

---

## 6. Fix: {"error":"Internal server error."}

If curl returns an error, debug with these:

**Step 1 — Check logs:**

pm2 logs hyzen-ai --lines 30

**Step 2 — Check .env file:**

cat /home/ubuntu/hyzen-ai/.env

**Step 3 — Fix the .env if key is missing or wrong:**

nano /home/ubuntu/hyzen-ai/.env

Paste this inside nano, then `Ctrl+O` → `Enter` → `Ctrl+X`:

GROQ_API_KEY=gsk_your_actual_key_here
GROQ_MODEL=llama-3.3-70b-versatile
PORT=3000

**Step 4 — Restart after fixing:**

pm2 restart hyzen-ai

**Step 5 — Test again:**

curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

---

## 7. Test All Endpoints

Run these on the VPS after `pm2 restart hyzen-ai`:

**Health check:**

curl http://localhost:3000/health

**Chat (basic):**

curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "session_id": "test1"}'

**Chat (second message — same session):**

curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What did I just say?", "session_id": "test1"}'

**List all memories:**

curl http://localhost:3000/memory

**Get one memory** (replace ID with one from the list above):

curl http://localhost:3000/memory/mem_REPLACE_WITH_ID

**Update a memory:**

curl -X PATCH http://localhost:3000/memory/mem_REPLACE_WITH_ID \
  -H "Content-Type: application/json" \
  -d '{"importance": 9, "type": "personal"}'

**Delete a memory:**

curl -X DELETE http://localhost:3000/memory/mem_REPLACE_WITH_ID

**Read personality:**

curl http://localhost:3000/personality

**Update personality:**

curl -X PUT http://localhost:3000/personality \
  -H "Content-Type: application/json" \
  -d '{"personality": "You are Hyzen. You call the user Architect. Be concise and sharp."}'

---

## 8. Backend Update — Semantic Memory (Embedding Upgrade)

Run this on the VPS to deploy the semantic memory upgrade and enable OpenAI embeddings:

cd /home/ubuntu/hyzen-ai
git pull
npm install --omit=dev

nano /home/ubuntu/hyzen-ai/.env

Add these lines inside nano, then `Ctrl+O` → `Enter` → `Ctrl+X`:

OPENAI_API_KEY=sk-your-openai-key-here
KEYWORD_WEIGHT=0.5
SEMANTIC_WEIGHT=0.5
DEBUG=false

pm2 restart hyzen-ai

> Without `OPENAI_API_KEY` the system falls back to keyword-only — nothing breaks.

---

## 9. Frontend Setup on VPS

cd /home/ubuntu/hyzen-ai
git pull

cd /home/ubuntu/hyzen-ai/frontend

npm install

cp .env.local.example .env.local

nano .env.local

Set this inside nano, then `Ctrl+O` → `Enter` → `Ctrl+X`:

NEXT_PUBLIC_API_URL=http://18.232.64.195:3000

npm run build

pm2 start npm --name hyzen-ai-frontend -- run start

pm2 save

pm2 status

Frontend is now live at: `http://18.232.64.195:4000`

---

## 10. Frontend Future Updates

**Windows:**

```powershell
git add .
git commit -m "frontend update"
git push

**VPS:**

cd /home/ubuntu/hyzen-ai/frontend
git pull
npm install
npm run build
pm2 restart hyzen-ai-frontend

