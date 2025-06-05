import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dbxyualwgrjzthqushvq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieHl1YWx3Z3JqenRocXVzaHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2OTQ3NjEsImV4cCI6MjA2NDI3MDc2MX0.S9yoCrPO7oljpW2VMJn2PKnWSVqZN7NYSugN-hUG5Go";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);