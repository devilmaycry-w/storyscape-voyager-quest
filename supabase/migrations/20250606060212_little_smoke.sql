/*
  # Revert token system and cleanup database

  1. Changes
    - Drop token-related functions
    - Drop user_tokens table
    - Remove generation metadata from stories table
    
  2. Security
    - No RLS changes needed as tables are being dropped
    
  3. Notes
    - This is a cleanup migration to remove the token system
*/

-- Drop functions first
DROP FUNCTION IF EXISTS public.check_and_update_tokens(UUID);
DROP FUNCTION IF EXISTS public.increment_tokens(UUID);

-- Drop the user_tokens table
DROP TABLE IF EXISTS public.user_tokens;

-- Remove generation metadata from stories table
ALTER TABLE public.stories 
DROP COLUMN IF EXISTS generation_prompt,
DROP COLUMN IF EXISTS tokens_used;