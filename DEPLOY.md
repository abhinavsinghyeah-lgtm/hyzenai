# Deployment Guide

---

## 1. Windows — Push to Git

powershell
cd "r:\Hyzen AI"
git init
git add .
git commit -m "initial: hyzen AI backend"
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

