/*
  # Add foreign key relationship between stories and profiles tables

  1. Changes
    - Add foreign key constraint from stories.user_id to profiles.id
    
  2. Security
    - No changes to RLS policies
    
  3. Notes
    - Using RESTRICT for ON DELETE to prevent orphaned stories
    - Using CASCADE for ON UPDATE to maintain referential integrity if profile IDs change
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'stories_user_id_fkey'
  ) THEN
    ALTER TABLE stories
    ADD CONSTRAINT stories_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES profiles(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;
  END IF;
END $$;