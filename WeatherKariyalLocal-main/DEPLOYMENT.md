# 🚀 Render Deployment Guide

## Automatic Deployment Setup

### **Step 1: Connect GitHub to Render**
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select your `WeatherKariyalLocal-main` repository

### **Step 2: Configure Service Settings**
```
Name: weather-kariyad-local
Environment: Node
Region: Choose closest to your users
Branch: main
```

### **Step 3: Build & Deploy Settings**
```
Build Command: npm run build
Start Command: npm run start
Node Version: 18
```

### **Step 4: Environment Variables (Optional)**
```
NODE_ENV=production
PORT=10000 (Render will set this automatically)
```

### **Step 5: Enable Auto-Deploy**
✅ **Auto-Deploy**: ON (default)
✅ **PR Previews**: ON (optional)

---

## ✨ How Auto-Deployment Works

### **After Initial Setup:**
1. **You push code to GitHub** 📤
2. **Render detects changes** 🔍
3. **Automatic build starts** 🔨
4. **New version deploys** 🚀
5. **Website is updated** ✅

### **Zero Manual Work Required!**
- ✅ Push to `main` branch → Auto deploy
- ✅ Data persists across deployments
- ✅ Build logs available in Render dashboard
- ✅ Rollback available if needed

---

## 📁 Data Persistence on Render

### **How Data Persists:**
- ✅ **Weather data** stored in `data/weather-data.json`
- ✅ **Survives server restarts** (unlike in-memory storage)
- ✅ **Survives deployments** (files persist)
- ✅ **Automatic backups** created when needed

### **Data Location on Render:**
```
/opt/render/project/src/data/weather-data.json
```

---

## 🎯 Deployment Checklist

### **Before First Deploy:**
- [ ] Repository connected to Render
- [ ] Build command: `npm run build`  
- [ ] Start command: `npm run start`
- [ ] Auto-deploy enabled
- [ ] Environment variables set (if any)

### **After Each Code Change:**
- [ ] Code tested locally with `npm run dev`
- [ ] Changes committed to git
- [ ] Pushed to GitHub `main` branch
- [ ] Render automatically deploys (no manual action needed!)

---

## 🔧 Troubleshooting Deployment

### **Build Fails:**
1. Check build logs in Render dashboard
2. Test locally: `npm run build`
3. Ensure all dependencies in `package.json`

### **App Won't Start:**
1. Check deploy logs in Render dashboard  
2. Test locally: `npm run start`
3. Verify start command is correct

### **Data Not Persisting:**
1. Check if `data/` directory exists
2. Verify file permissions in logs
3. Test locally first

### **Auto-Deploy Not Working:**
1. Verify "Auto-Deploy" is ON in Render settings
2. Check webhook settings in GitHub repository
3. Ensure pushing to correct branch (`main`)

---

## 📊 Monitoring Your Deployment

### **Render Dashboard:**
- 📈 **Metrics**: CPU, Memory, Response times
- 📋 **Logs**: Build logs, Deploy logs, App logs
- 🔄 **Deploys**: History of all deployments
- ⚙️ **Settings**: Environment, Build commands

### **Important URLs:**
- **Live App**: `https://your-service-name.onrender.com`
- **Dashboard**: `https://dashboard.render.com/web/your-service-id`

---

## 🎊 Success! 

Once set up, your workflow becomes:

1. **Make changes locally** 💻
2. **Test with `npm run dev`** 🧪  
3. **Push to GitHub** 📤
4. **Render auto-deploys** 🚀
5. **Website is updated!** ✨

**No manual deployment steps needed ever again!** 🎉