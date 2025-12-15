-- Complete migration script: Rename 'deal' to 'business' and 'profiles' to 'users'
-- Execute this script in your Supabase SQL editor or database management tool
-- This migration handles both existing databases and fresh installations

DO $$
BEGIN
    -- STEP 1: Migrate profiles to users
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        -- Rename profiles table to users
        ALTER TABLE profiles RENAME TO users;
        
        -- Rename the index
        ALTER INDEX IF EXISTS idx_profiles_manager_id RENAME TO idx_users_manager_id;
        
        RAISE NOTICE 'Successfully renamed profiles table to users and updated indexes';
    ELSE
        -- If profiles table doesn't exist, check if users table exists
        IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
            -- Create users table from scratch (for fresh installations)
            CREATE TABLE users (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              name TEXT NOT NULL,
              role TEXT NOT NULL,
              manager_id UUID REFERENCES users(id),
              email TEXT NOT NULL,
              created_at TIMESTAMPTZ DEFAULT NOW()
            );
            
            -- Create index for better query performance
            CREATE INDEX idx_users_manager_id ON users(manager_id);
            
            RAISE NOTICE 'Created new users table with indexes';
        ELSE
            RAISE NOTICE 'Users table already exists, no migration needed';
        END IF;
    END IF;

    -- STEP 2: Migrate deal to business
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'deal') THEN
        -- Rename the table
        ALTER TABLE deal RENAME TO business;
        
        -- Rename the indexes to match the new table name
        ALTER INDEX IF EXISTS idx_deal_account_id RENAME TO idx_business_account_id;
        ALTER INDEX IF EXISTS idx_deal_owner_id RENAME TO idx_business_owner_id;
        ALTER INDEX IF EXISTS idx_deal_stage RENAME TO idx_business_stage;
        
        RAISE NOTICE 'Successfully renamed deal table to business and updated indexes';
    ELSE
        -- If deal table doesn't exist, check if business table exists
        IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'business') THEN
            -- Create business table from scratch (for fresh installations)
            CREATE TABLE business (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              title TEXT NOT NULL,
              account_id UUID NOT NULL REFERENCES account(id),
              value NUMERIC NOT NULL,
              currency TEXT NOT NULL,
              stage TEXT NOT NULL,
              probability INTEGER,
              owner_id UUID REFERENCES users(id),
              closing_date DATE,
              created_at TIMESTAMPTZ DEFAULT NOW()
            );
            
            -- Create indexes for better query performance
            CREATE INDEX idx_business_account_id ON business(account_id);
            CREATE INDEX idx_business_owner_id ON business(owner_id);
            CREATE INDEX idx_business_stage ON business(stage);
            
            RAISE NOTICE 'Created new business table with indexes';
        ELSE
            RAISE NOTICE 'Business table already exists, no migration needed';
        END IF;
    END IF;

    -- STEP 3: Update account table references if needed
    -- Update foreign key constraint to reference users instead of profiles
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'account') THEN
        -- Check if the constraint exists and update it
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name LIKE '%owner_id%' 
            AND table_name = 'account'
        ) THEN
            -- Drop old constraint and create new one (this is safe as data remains intact)
            ALTER TABLE account DROP CONSTRAINT IF EXISTS account_owner_id_fkey;
            ALTER TABLE account ADD CONSTRAINT account_owner_id_fkey 
                FOREIGN KEY (owner_id) REFERENCES users(id);
            
            RAISE NOTICE 'Updated account table foreign key to reference users';
        END IF;
    END IF;
END
$$;

-- Verification queries
-- Check that the users table exists
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name IN ('users', 'business');

-- Check that indexes were created/renamed successfully
SELECT 
    indexname,
    tablename
FROM pg_indexes 
WHERE tablename IN ('users', 'business');

-- Check data integrity (if tables have data)
SELECT 'users' as table_name, COUNT(*) as total_records FROM users
UNION ALL
SELECT 'business' as table_name, COUNT(*) as total_records FROM business;