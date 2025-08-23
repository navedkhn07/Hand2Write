import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nueuzhjcevkkzuyxykil.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZXV6aGpjZXZra3p1eXh5a2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NTA5MjYsImV4cCI6MjA3MDMyNjkyNn0.x7S4fUK37uJpkLgB4mOEteSfJvLHMaaPbjfjFAUfx44'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
