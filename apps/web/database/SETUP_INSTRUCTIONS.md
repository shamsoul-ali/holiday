# Database Setup Instructions

## 🚨 **Quick Fix for the Foreign Key Error**

The error you encountered happens because the seed.sql file tried to create demo users without first creating entries in the `auth.users` table. Here's how to fix it:

## Option 1: Use the Safe Seed File (Recommended)

```sql
-- In Supabase SQL Editor, run this instead:
```

1. Go to your Supabase SQL Editor
2. Run the contents of `database/seed-safe.sql` instead of `database/seed.sql`
3. This will populate destinations and other non-user data safely

## Option 2: Clean Up and Use Updated Seed File

If you already ran the problematic seed.sql:

1. **Clean up the database first:**
```sql
-- Delete any problematic data
DELETE FROM public.users WHERE id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');
DELETE FROM public.itineraries WHERE user_id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');
DELETE FROM public.bookings WHERE user_id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');
DELETE FROM public.reviews WHERE user_id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');
DELETE FROM public.favorites WHERE user_id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');
```

2. **Now run the updated seed.sql file** - it will skip the demo user creation

## ✅ **Recommended Database Setup Process**

1. **Create Supabase Project**
2. **Run Main Schema:**
   ```sql
   -- Copy and paste contents of database/schema.sql
   ```

3. **Run Safe Seed Data:**
   ```sql
   -- Copy and paste contents of database/seed-safe.sql
   ```

4. **Test the Application:**
   - Start your app: `npm run dev`
   - Go to `http://localhost:3010`
   - Click "Sign In" and create a new account
   - This will create a proper user entry in both `auth.users` and `public.users`

## 🎯 **What This Approach Does**

- ✅ **Avoids foreign key issues** by not creating fake users
- ✅ **Populates destinations** for the AI to recommend
- ✅ **Sets up all database structure** correctly
- ✅ **Allows real user registration** through the app
- ✅ **Maintains data integrity** with proper relationships

## 🧪 **Testing Your Setup**

After running the safe seed:

1. **Register a new account** through the web interface
2. **Generate an itinerary** - it will save to your account
3. **Check your dashboard** - you'll see your statistics
4. **Update your profile** - travel preferences will be saved
5. **View the database** - you'll see real user data properly linked

## 🔧 **Alternative: Create Demo Users Through App**

If you want demo data:

1. Use the web interface to register these accounts:
   - `demo.user@example.com` (password: anything you choose)
   - `budget.traveler@example.com` (password: anything you choose)

2. Create some itineraries through the UI

3. The data will be properly linked and functional

This approach is much safer and follows Supabase best practices! 🚀