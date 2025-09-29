# Weather Kariyad Local - Development Guide

## Overview
This is a full-stack weather monitoring application built with:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Data Storage**: File-based JSON storage (no database required)
- **Deployment**: Render-ready with persistent data storage

## 🚀 Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd WeatherKariyalLocal-main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   # This will start both client and server in development mode
   npm run dev
   ```

4. **Open your browser:**
   - Navigate to `http://localhost:5173`
   - The API will be running on `http://localhost:5173/api`

## 🏗️ Project Structure

```
WeatherKariyalLocal-main/
├── client/                 # React frontend
│   ├── components/        # Reusable UI components
│   ├── pages/            # Main application pages
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utility functions
├── server/                # Express.js backend
│   ├── routes/           # API route handlers
│   ├── storage/          # Data persistence layer
│   └── index.ts          # Server entry point
├── shared/               # Shared types between client/server
├── data/                 # JSON data files (created automatically)
├── public/               # Static assets
└── dist/                 # Built files for production
```

## 📊 Data Storage

### How it works:
- Weather data is stored in `data/weather-data.json`
- Automatic backups are created when needed
- Data persists across server restarts (perfect for Render)
- No database setup required

### Data Location:
- **Development**: `./data/weather-data.json`
- **Production**: `/app/data/weather-data.json` (on Render)

## 🛠️ Available Scripts

### Development
```bash
npm run dev          # Start development server (client + server)
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run typecheck    # Check TypeScript types
npm run format.fix   # Format code with Prettier
```

### Build Process
```bash
npm run build:client    # Build React client
npm run build:server    # Build Express server
```

## 📱 Features

### Current Features:
- ✅ **Weather Data Entry**: Manual entry of daily weather data
- ✅ **Historical Data**: View and analyze past weather records
- ✅ **Data Visualization**: Charts for temperature and rainfall trends
- ✅ **Data Filtering**: Filter by year and month
- ✅ **Data Export**: Download data in JSON or CSV format
- ✅ **Admin Controls**: Password-protected data management
- ✅ **Persistent Storage**: File-based storage that survives server restarts

### API Endpoints:
- `GET /api/weather/today` - Get today's weather with comparisons
- `GET /api/weather/history` - Get historical data (with optional year/month filters)
- `POST /api/weather/add` - Add new weather data
- `DELETE /api/weather/delete/:id` - Delete weather data (admin only)
- `GET /api/weather/download` - Download data in JSON/CSV format
- `GET /api/weather/dates` - Get available years and months

## 🔧 Configuration

### Environment Variables (Optional):
Create a `.env` file in the root directory:
```env
PORT=3000                    # Server port (default: 3000)
NODE_ENV=development         # Environment mode
ADMIN_PASSWORD=12345         # Admin password (default: 12345)
```

### Render Deployment:
The app is configured for Render deployment with:
- Build command: `npm run build`
- Start command: `npm run start`
- Node version: 18+

## 🔐 Admin Features

### Admin Access:
- Click "Admin" button in the History page
- Default password: `12345`
- Admin can delete weather records

### To change admin password:
Update the password check in `client/pages/History.tsx`:
```typescript
if (adminPassword === "YOUR_NEW_PASSWORD") {
```

## 📁 Data Management

### Backup Creation:
The system automatically creates backups:
- Format: `weather-data-backup-TIMESTAMP.json`
- Location: `data/` directory
- Triggered on critical operations

### Manual Data Management:
```bash
# View current data
cat data/weather-data.json

# Create manual backup
cp data/weather-data.json data/manual-backup-$(date +%Y%m%d).json

# Reset data (careful!)
rm data/weather-data.json
# The system will recreate with default sample data
```

## 🚀 Deployment to Render

### Steps:
1. **Connect your GitHub repository** to Render
2. **Create a new Web Service**
3. **Configure build settings:**
   - Build Command: `npm run build`
   - Start Command: `npm run start`
   - Node Version: 18+
4. **Deploy!**

### Important for Render:
- ✅ File storage persists across deployments
- ✅ No database configuration needed
- ✅ Environment variables can be set in Render dashboard
- ✅ Automatic builds on git push

## 🐛 Troubleshooting

### Common Issues:

1. **Data not persisting:**
   - Check if `data/` directory exists
   - Verify file permissions
   - Check server logs for JSON parsing errors

2. **Build errors:**
   ```bash
   # Clear node modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Port conflicts:**
   ```bash
   # Kill process using port 5173
   lsof -ti:5173 | xargs kill -9
   ```

4. **TypeScript errors:**
   ```bash
   # Check types
   npm run typecheck
   ```

### Development Tips:

1. **Hot Reload**: Both client and server support hot reload in development
2. **API Testing**: Use browser dev tools or Postman to test API endpoints
3. **Data Debugging**: Check `data/weather-data.json` to see stored data
4. **Log Monitoring**: Server logs show all API calls and errors

## 📋 Feature Roadmap

### Planned Enhancements:
- [ ] Weather data import from CSV
- [ ] More chart types and visualizations
- [ ] Weather alerts and notifications
- [ ] API authentication
- [ ] Automated weather station integration
- [ ] Mobile app development

## 🔒 Security Notes

- Admin password is hardcoded (change for production)
- No authentication for API endpoints (except delete)
- File-based storage is readable by server process
- Consider implementing JWT tokens for production

## 📞 Support

### Getting Help:
1. Check the console for error messages
2. Review server logs for API errors
3. Verify data file structure in `data/weather-data.json`
4. Test API endpoints directly with curl or Postman

### Common API Tests:
```bash
# Test server health
curl http://localhost:5173/api/ping

# Get weather history
curl http://localhost:5173/api/weather/history

# Add weather data
curl -X POST http://localhost:5173/api/weather/add \
  -H "Content-Type: application/json" \
  -d '{"date":"2024-01-20","rainfall":5.2,"maxTemperature":28.5,"minTemperature":22.1,"humidity":75}'
```

---

## 🎯 Project Goals Achieved

✅ **Data Persistence Problem Solved**: Weather data now persists across server restarts on Render
✅ **Enhanced History Page**: Added month/year filtering and download capabilities  
✅ **No Database Required**: Simple file-based storage that works everywhere
✅ **Production Ready**: Optimized for Render deployment with persistent storage

The application is now ready for reliable production use with persistent data storage!