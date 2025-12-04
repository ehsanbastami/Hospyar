import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uhpakwrplqpizypsldtg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVocGFrd3JwbHFwaXp5cHNsZHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDY3MjMsImV4cCI6MjA4MDQyMjcyM30.Y0f9AETUG_Lewqh57Kh9A3pt16jyuaC730wOA5vMbNg';

export const supabase = createClient(supabaseUrl, supabaseKey);