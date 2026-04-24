import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wsxooupnxyyhwbvdlbge.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzeG9vdXBueHl5aHdidmRsYmdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMTIyMzQsImV4cCI6MjA5MjU4ODIzNH0.FzoClGmjHX-uIL7Gs9bIOyvujIClqkxGddkYQhs3Vks'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
