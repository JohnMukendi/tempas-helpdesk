const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://uxvjludaowjtdoarevox.supabase.co';
const supabaseAnonKey = 'sb_publishable_SnN0AbYmMLmRpin2p2X0LQ_rbxyHS9L';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('presence').select('*').limit(1);
  if (error) {
    console.error('Error fetching presence table:', error);
  } else {
    console.log('Presence data:', data);
  }
}
check();
