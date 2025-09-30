# Supabase Setup Guide

## What is Supabase?
Supabase is an open-source Firebase alternative that provides a PostgreSQL database, authentication, real-time subscriptions, and more. It's perfect for your weather app with a generous free tier and persistent storage.

## Benefits of Supabase:
- ✅ **Free Forever Tier**: 500MB database, 50MB file storage, 2GB bandwidth
- ✅ **PostgreSQL Database**: Reliable, ACID-compliant database
- ✅ **Real-time Features**: Live updates (future enhancement)
- ✅ **Auto-generated APIs**: REST and GraphQL APIs
- ✅ **Dashboard**: Visual database management
- ✅ **No Sleep Mode**: Always available (unlike Render free tier)

## Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

## Step 2: Create a New Project

1. Click "New Project" in your Supabase dashboard
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name**: `weather-kariyal` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., `US East` for North America)
4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

## Step 3: Create Weather Data Table

1. In your project dashboard, go to **Table Editor** (left sidebar)
2. Click "Create a new table"
3. Set table name: `weather_data`
4. **Disable RLS** (Row Level Security) for now - uncheck "Enable RLS"
5. Add these columns:

| Column Name | Type | Primary | Nullable | Default |
|------------|------|---------|----------|---------|
| `id` | `int8` | ✅ | ❌ | `identity` |
| `date` | `date` | ❌ | ❌ | - |
| `rainfall` | `float8` | ❌ | ❌ | - |
| `maxTemperature` | `float8` | ❌ | ❌ | - |
| `minTemperature` | `float8` | ❌ | ❌ | - |
| `humidity` | `int4` | ❌ | ❌ | - |
| `createdAt` | `timestamptz` | ❌ | ❌ | `now()` |
| `updatedAt` | `timestamptz` | ❌ | ❌ | `now()` |

6. Click "Save" to create the table

## Step 4: Get API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API** (in left sidebar)
2. Copy these values:

   **Project URL** (copy exactly as shown):
   ```
   https://your-project-ref.supabase.co
   ```
   
   **API Keys** - You'll see several keys, use the **anon public** key:
   - ✅ **anon public** (starts with `eyJ0eXAiOiJKV1Q...`) - **USE THIS ONE**
   - ❌ **service_role** (also starts with `eyJ0eXAi...`) - **DON'T USE** (this is for admin operations)
   
   The **anon public** key is safe to use in your application and has the right permissions.

## Step 5: Configure Environment Variables

### For Local Development:

Create a `.env` file in your project root:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_API_KEY=your-anon-key-here
SUPABASE_WEATHER_TABLE=weather_data

# Application Configuration  
NODE_ENV=development
PORT=3000
```

### For Render Deployment:

1. Go to your Render dashboard
2. Select your web service
3. Go to **Environment** tab
4. Add these environment variables:
   - `SUPABASE_URL`: Your project URL
   - `SUPABASE_API_KEY`: Your anon/public key
   - `SUPABASE_WEATHER_TABLE`: `weather_data`

## Step 6: Test the Connection

1. Start your app locally:
   ```bash
   npm run dev
   ```

2. Check the console logs - you should see:
   ```
   Using Supabase for persistent storage
   ```

3. Add some weather data through your app
4. Check your Supabase dashboard → Table Editor → `weather_data` table
5. Your data should appear there instantly!

## Step 7: Deploy to Render

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Add Supabase integration"
   git push origin main
   ```

2. Render will automatically deploy
3. Check deployment logs for: `Using Supabase for persistent storage`
4. Test your deployed app - data should persist across restarts!

## Troubleshooting

### Common Issues:

1. **"Supabase credentials not configured"**
   - Check environment variables are set correctly
   - Verify project URL and API key

2. **"Supabase error: 400"**
   - Check table name matches `SUPABASE_WEATHER_TABLE`
   - Verify column names match the schema

3. **"Supabase error: 401"**
   - Invalid API key
   - Make sure you're using the **anon public** key, not service_role
   - The anon public key is the longer one that starts with `eyJ0eXAiOiJKV1Q`

4. **"Supabase error: 404"**
   - Table doesn't exist or wrong name
   - Check table was created successfully

5. **RLS Policy Error**
   - Make sure RLS is disabled on `weather_data` table
   - Or create appropriate policies if you enable RLS

### Debug Steps:

1. **Check Supabase Dashboard**:
   - Go to Table Editor → weather_data
   - Verify table structure matches requirements
   - Check if data is being inserted

2. **Check Application Logs**:
   - Look for "Using Supabase..." or "Using file storage..." messages
   - Check for specific error messages

3. **Test API Directly**:
   ```bash
   curl -X GET "https://your-project-ref.supabase.co/rest/v1/weather_data" \
     -H "apikey: your-anon-key" \
     -H "Authorization: Bearer your-anon-key"
   ```

## Optional: Add Sample Data

If you want to start with some sample data, go to **SQL Editor** in Supabase and run:

```sql
INSERT INTO weather_data (date, rainfall, "maxTemperature", "minTemperature", humidity)
VALUES 
  ('2025-01-15', 12.5, 32.1, 24.8, 78),
  ('2025-01-14', 8.2, 31.5, 25.3, 75),
  ('2025-01-13', 0.0, 33.2, 26.1, 72);
```

## Security Best Practices

1. **Environment Variables**:
   - Never commit `.env` files to Git
   - Use different projects for dev/production
   - Rotate API keys periodically

2. **Database Security**:
   - Enable RLS when you need user-specific data
   - Create appropriate policies for your use case
   - Use service role key only for admin operations

3. **Monitoring**:
   - Monitor usage in Supabase dashboard
   - Set up alerts for quota limits
   - Enable database backups

## What's Next?

After completing this setup:

1. **Your app will have persistent storage** - no more data loss on Render!
2. **Real-time updates** - Consider adding live updates in the future
3. **Backup & Recovery** - Supabase handles this automatically
4. **Scaling** - Easy to upgrade when you need more resources

Your weather monitoring app is now production-ready with reliable, persistent storage! 🎉

---

## Quick Reference

| Item | Value |
|------|-------|
| **Table Name** | `weather_data` |
| **Required Env Vars** | `SUPABASE_URL`, `SUPABASE_API_KEY` |
| **Free Tier Limits** | 500MB DB, 50MB storage, 2GB bandwidth |
| **Dashboard URL** | `https://app.supabase.com/project/your-ref` |

Need help? Check the [Supabase Documentation](https://supabase.com/docs) or their community Discord.