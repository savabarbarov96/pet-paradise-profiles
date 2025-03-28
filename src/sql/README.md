# Pet Paradise Profile Image Upload Fix

This folder contains SQL scripts to fix the functionality that allows unauthorized users to upload images to public pet profiles.

## Issue Description

Currently, there's an issue where unauthorized users are unable to upload images to public pet profiles. This is due to restrictive RLS (Row-Level Security) policies on the pet_media table and storage buckets.

## Fix Files

1. `fix_pet_media_policies.sql` - Updates the RLS policies for the pet_media table and storage buckets to allow uploads to public profiles.
2. `fix_guest_column_issue.sql` - Adds a missing `guest_name` column to the pet_media table.

## How to Run the SQL Scripts

### Via Supabase Dashboard

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of both SQL files one after another
4. Run the scripts

### Via CLI

If you have the Supabase CLI installed:

```bash
# Run the first script
supabase db execute -f ./src/sql/fix_pet_media_policies.sql

# Run the second script
supabase db execute -f ./src/sql/fix_guest_column_issue.sql
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
2. Adding a new `guest_name` column to the pet_media table
3. Updating the ProfilePreview component to show an upload option for public profiles
4. Adding a guest name input for unauthorized users
5. Ensuring the media service handles unauthorized uploads correctly with the guest_name field

The updated system now allows guests to upload images to public profiles with a name attribution. 