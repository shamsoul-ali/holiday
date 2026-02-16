# Holiday AI Database Setup Guide

## 🗄️ Supabase Database Configuration

This guide will help you set up the complete database schema for your Holiday AI platform using Supabase.

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `holiday-ai-platform`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users (e.g., Singapore for SEA)
5. Click "Create new project"

## Step 2: Configure Environment Variables

After your project is created, get your project credentials:

1. Go to **Settings** > **API**
2. Copy your:
   - **Project URL** 
   - **anon/public key**
   - **service_role key** (keep this secret!)

Update your `.env.local` file:

```env
# Replace with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 3: Set Up Database Schema

### 3.1 Create Main Schema
1. In Supabase Dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the entire contents of `database/schema.sql`
4. Run the query (this will create all tables, indexes, policies, and functions)

### 3.2 Add Sample Data (Optional)
1. Create another new query
2. Copy and paste the contents of `database/seed.sql`
3. Run the query (this adds sample destinations and test data)

## Step 4: Configure Authentication

### 4.1 Enable Email Authentication
1. Go to **Authentication** > **Settings**
2. Ensure **Enable email confirmations** is toggled on
3. Set **Site URL** to `http://localhost:3010` (development) or your production URL

### 4.2 Configure OAuth Providers (Optional)
For social login (Google, GitHub, etc.):

1. Go to **Authentication** > **Providers**
2. Enable desired providers (Google, GitHub, Facebook)
3. Add your OAuth app credentials
4. Set redirect URLs to:
   - Development: `http://localhost:3010/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

### 4.3 Email Templates
1. Go to **Authentication** > **Email Templates**
2. Customize the email templates for:
   - Confirm signup
   - Reset password
   - Magic link

## Step 5: Configure Row Level Security

The schema automatically sets up Row Level Security (RLS) policies, but verify they're enabled:

1. Go to **Authentication** > **Policies**
2. Check that all tables have appropriate policies:
   - **users**: Users can only access their own data
   - **itineraries**: Users can access their own + public itineraries
   - **bookings**: Users can only access their own bookings
   - **favorites**: Users can only access their own favorites
   - **reviews**: Public read, users can only modify their own
   - **destinations**: Public read access (no RLS needed)

## Step 6: Database Performance Optimization

### 6.1 Indexes (Already Created)
The schema includes optimized indexes for:
- User-specific queries
- Search and filtering
- Date-based queries
- Performance-critical lookups

### 6.2 Monitoring
1. Go to **Reports** to monitor:
   - Database performance
   - Query execution times
   - Connection usage

## Step 7: Test Database Connection

Once setup is complete, test the connection:

```bash
# In your project directory
npm run dev
```

Visit `http://localhost:3010/api/status` to check if Supabase connection is working.

## Database Schema Overview

### Core Tables:

1. **users** - Extended user profiles (linked to auth.users)
2. **destinations** - Travel destinations with details
3. **itineraries** - User-created travel plans
4. **bookings** - Trip bookings and reservations
5. **favorites** - User favorite destinations/itineraries
6. **reviews** - User reviews and ratings

### Key Features:

- **Automatic timestamps** with updated_at triggers
- **UUID primary keys** for security
- **JSON/JSONB columns** for flexible data storage
- **Row Level Security** for data protection
- **Database functions** for complex operations
- **Performance indexes** for fast queries

## Backup and Recovery

### Automated Backups
Supabase automatically creates daily backups. Configure retention:
1. Go to **Settings** > **Database**
2. Set backup retention period
3. Enable point-in-time recovery if needed

### Manual Backup
```sql
-- Export specific tables
pg_dump --host=your-host --port=5432 --username=postgres --table=public.users --data-only --file=users_backup.sql your-database-name
```

## Production Considerations

1. **Database Scaling**: Monitor usage and upgrade tier as needed
2. **Connection Pooling**: Supabase handles this automatically
3. **SSL**: Always enabled by default
4. **Monitoring**: Set up alerts for high usage
5. **Security**: Regularly review and update RLS policies

## Troubleshooting

### Common Issues:

1. **Connection Errors**: Check environment variables
2. **RLS Blocking Queries**: Verify user authentication
3. **Migration Failures**: Check SQL syntax and dependencies
4. **Performance Issues**: Review query patterns and indexes

### Debug Mode:
Add to `.env.local` for debugging:
```env
NEXT_PUBLIC_SUPABASE_DEBUG=true
```

## Next Steps

After database setup:
1. Test authentication flows
2. Create sample user accounts
3. Test itinerary creation and booking
4. Verify all API endpoints work correctly
5. Set up monitoring and alerts

## Support

For issues:
- Check [Supabase Documentation](https://supabase.com/docs)
- Review [Supabase Discord Community](https://discord.supabase.com/)
- Check project logs in Supabase Dashboard