import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fzrlcyfujcoxtpipovqh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6cmxjeWZ1amNveHRwaXBvdnFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NzQxMTIsImV4cCI6MjA5MjI1MDExMn0.R-7sqjjXtoIl4_0ywLczhYNnMsjm_2c4OwKLlkOJSKk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
