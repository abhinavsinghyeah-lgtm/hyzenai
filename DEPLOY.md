# Deployment Guide

---

## 1. Windows — Push to Git

```powershell
cd "r:\Hyzen AI"
git init
git add .
git commit -m "initial: hyzen AI backend"
git branch -M main
git remote add origin https://github.com/abhinavsinghyeah-lgtm/hyzenai
git push -u origin main
```

---

## 2. Windows — SSH into AWS VPS

```powershell
ssh -i "your-key.pem" ubuntu@YOUR_VPS_IP
```

---

## 3. VPS — Run Top to Bottom

```bash
cd /home/ubuntu
```

```bash
sudo apt update && sudo apt upgrade -y
```

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
```

```bash
sudo apt install -y nodejs git
```

```bash
node -v
npm -v
```

```bash
sudo npm install -g pm2
```

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git hyzen-ai
```

```bash
cd /home/ubuntu/hyzen-ai
```

```bash
npm install --omit=dev
```

```bash
cp .env.example .env
```

```bash
nano .env
```

> Inside nano paste this, fill in your key, then press `Ctrl+O` → `Enter` → `Ctrl+X`

```
GROQ_API_KEY=gsk_your_actual_key_here
GROQ_MODEL=llama3-70b-8192
PORT=3000
```

```bash
pm2 start index.js --name hyzen-ai
```

```bash
pm2 status
```

```bash
pm2 save
```

```bash
pm2 startup
```

> Copy the command that `pm2 startup` prints and run it. It looks like this:

```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

---

## 4. Every Future Update

**Windows:**

```powershell
git add .
git commit -m "update"
git push
```

**VPS:**

```bash
cd /home/ubuntu/hyzen-ai
git pull
npm install --omit=dev
pm2 restart hyzen-ai
```

---

## 5. Useful PM2 Commands

```bash
pm2 logs hyzen-ai
pm2 status
pm2 restart hyzen-ai
pm2 stop hyzen-ai
```
