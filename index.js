import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://jlccaghkykhwvituxmve.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsY2NhZ2hreWtod3ZpdHV4bXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY2NTA3MTMsImV4cCI6MjAzMjIyNjcxM30.0n6y-a3gz98ZB4s0ww7R11Suuf9Wm8LhElRCvi89ANg";
const client = createClient(supabaseUrl, supabaseKey)

document.addEventListener('DOMContentLoaded', function() {
    console.log('Document is fully loaded');
});
