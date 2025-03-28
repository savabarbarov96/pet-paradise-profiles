# Pet Paradise Profile Image Upload Fix

This folder contains SQL scripts to fix the functionality that allows unauthorized users to upload images to public pet profiles.

## Issue Description

Currently, there's an issue where unauthorized users are unable to upload images to public pet profiles. This is due to restrictive RLS (Row-Level Security) policies on the pet_media table and storage buckets.

## Fix Files

1. `fix_pet_media_policies.sql` - Updates the RLS policies for the pet_media table and storage buckets to allow uploads to public profiles.
2. `fix_guest_column_issue.sql` - Adds a missing `guest_name` column to the pet_media table.
3. `fix_foreign_key_issue.sql` - Makes the user_id column nullable and updates policies to allow guest uploads without violating foreign key constraints.
4. `fix_rls_policy.sql` - Completely rebuilds all RLS policies to ensure guest uploads work properly.

## How to Run the SQL Scripts

### Via Supabase Dashboard

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. **Important: For the fastest fix, just run the final script**:
   - Run `fix_rls_policy.sql` which combines all the necessary fixes
   
   Or if you prefer to run them sequentially:
   - First: `fix_pet_media_policies.sql`
   - Second: `fix_guest_column_issue.sql`
   - Third: `fix_foreign_key_issue.sql`
   - Fourth: `fix_rls_policy.sql`

4. Run the scripts

### Via CLI

If you have the Supabase CLI installed:

```bash
# For the fastest fix, just run the final script
supabase db execute -f ./src/sql/fix_rls_policy.sql

# Or run all scripts in order if preferred
# supabase db execute -f ./src/sql/fix_pet_media_policies.sql
# supabase db execute -f ./src/sql/fix_guest_column_issue.sql
# supabase db execute -f ./src/sql/fix_foreign_key_issue.sql
# supabase db execute -f ./src/sql/fix_rls_policy.sql
```

## Testing the Functionality

After running the SQL scripts, you can test the functionality by:

1. Viewing a public pet profile in an incognito/private browser window (to ensure you're not authenticated)
2. Hover over the pet's profile picture - you should see a camera icon appear
3. Click on the camera icon
4. Enter your name in the prompt (this is required for the guest_name field)
5. Click Upload Photo
6. Select an image file
7. The image should upload successfully and display on the pet's profile

## Implementation Details

The fix involves:

1. Modifying the RLS policies to allow anonymous uploads to public profiles
2. Adding a new `guest_name` column to the pet_media table for guest attribution
3. Making the `user_id` column nullable for guest uploads
4. Completely rebuilding all RLS policies to ensure a clean implementation
5. Updating the ProfilePreview component to show an upload option for public profiles
6. Adding a guest name input for unauthorized users
7. Ensuring the media service handles unauthorized uploads correctly:
   - Setting user_id to null for guest uploads
   - Adding guest_name for attribution
   - Using the appropriate storage path structure

The updated system now allows guests to upload images to public profiles with a name attribution without violating foreign key constraints or RLS policies. 