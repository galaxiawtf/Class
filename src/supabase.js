import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://pjupqaoqnfekqcycujat.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqdXBxYW9xbmZla3FjeWN1amF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NTczODAsImV4cCI6MjA5NzMzMzM4MH0.S5NQDNk4AeLfSNf2oog3pa5l8qa3NR8E731PT3UmZfg";

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
