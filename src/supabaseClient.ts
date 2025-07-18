import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://yiedrhyedmqaibvdwltx.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpZWRyaHllZG1xYWlidmR3bHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MDczNzAsImV4cCI6MjA2ODE4MzM3MH0.MCN285emK7oVDo1xuv0AtMPBNsHQDkmOMC65I4u-xDA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 