# 🚀 Deploy Your Wine Service App NOW

## Option 1: Railway.app (EASIEST - 2 Minutes!)

### Step 1: Install Railway CLI
```bash
# macOS/Linux
curl -fsSL https://railway.app/install.sh | sh

# Windows (PowerShell)
iwr https://railway.app/install.ps1 | iex
```

### Step 2: Login
```bash
railway login
```
(Opens browser to authenticate with GitHub)

### Step 3: Deploy
```bash
cd /path/to/WineServiceApp
railway init
railway up
```

### Step 4: Open Your App
```bash
railway open
```

**Done! Your app is live!** 🎉

Railway automatically:
- Detects Dockerfile
- Builds your image
- Deploys to production
- Gives you a live URL
- Sets up HTTPS

---

## Option 2: Render.com (Free Tier)

### Step 1: Sign Up
1. Go to https://render.com/
2. Click "Get Started"
3. Sign up with GitHub

### Step 2: New Web Service
1. Click "New +" → "Web Service"
2. Connect your WineServiceApp repository
3. Fill in:
   - **Name:** wine-service-app
   - **Environment:** Docker
   - **Instance Type:** Free

### Step 3: Environment Variables
Add these:
```
SECRET_KEY=your-secret-key-here-change-me
ACCESS_TOKEN_EXPIRE_MINUTES=120
```

### Step 4: Deploy
Click "Create Web Service"

Wait 5-10 minutes → Your app is live!

---

## Option 3: Vercel (Serverless - Fast)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
cd /path/to/WineServiceApp
vercel
```

Follow the prompts, and you're done!

---

## Option 4: Fly.io (Good for Production)

### Step 1: Install Fly CLI
```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### Step 2: Login & Deploy
```bash
cd /path/to/WineServiceApp
fly auth login
fly launch
```

Answer the prompts:
- App name: wine-service-app
- Region: Choose closest
- Database: No (we use SQLite)

Then:
```bash
fly deploy
```

**Done!**

---

## ⚡ Fastest Option Summary

**If you want it live in 2 minutes:**
```bash
curl -fsSL https://railway.app/install.sh | sh
railway login
cd /path/to/WineServiceApp
railway init
railway up
railway open
```

**If you prefer web UI:**
Go to Render.com → Connect repo → Deploy

---

## 🧪 Testing After Deployment

Once deployed, test your live app:

### 1. Check Health
```bash
curl https://your-app-url.com/api/healthz
# Should return: {"ok": true}
```

### 2. Test Login
```bash
curl -X POST https://your-app-url.com/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=manager1&password=pass"
# Should return: JWT token
```

### 3. Browse
Open in browser:
```
https://your-app-url.com/
```

Login with: **manager1** / **pass**

---

## 🔧 Troubleshooting

### Port Issues
Most platforms auto-detect the PORT environment variable. Your Dockerfile is configured to use `$PORT`.

### Database Issues
SQLite database will be created automatically on first run.

### CORS Issues
Update `backend/app/main.py` to add your deployment URL to allowed origins.

### Environment Variables
Make sure to set:
- `SECRET_KEY` (for JWT)
- `ACCESS_TOKEN_EXPIRE_MINUTES` (120)

---

## 📊 Which Platform Should I Choose?

| Platform | Pros | Cons | Cost |
|----------|------|------|------|
| **Railway** | Easiest, CLI + Web, Auto-deploy | Limited free tier | $5/mo after free |
| **Render** | True free tier, Simple UI | Slower cold starts | Free tier available |
| **Vercel** | Super fast, Great DX | Serverless limitations | Free tier generous |
| **Fly.io** | Best performance, Good free tier | Slightly complex | Free tier available |

**My Recommendation:** Start with **Railway** (fastest) or **Render** (easiest free tier)

---

## 🎯 After Deployment

Your Wine Service App will be live at:
- Railway: `https://your-app.up.railway.app`
- Render: `https://wine-service-app.onrender.com`
- Fly.io: `https://wine-service-app.fly.dev`

**Demo it to your client with these credentials:**
- manager1 / pass
- sommelier1 / pass
- expo1 / pass

---

## 💡 Pro Tips

1. **Custom Domain:** All platforms support custom domains
2. **Auto-deploy:** Connects to GitHub - deploys on every push
3. **Logs:** Check platform dashboard for logs
4. **Scaling:** Can scale up when ready for production

---

**Pick a platform and deploy in minutes! 🍷🚀**
