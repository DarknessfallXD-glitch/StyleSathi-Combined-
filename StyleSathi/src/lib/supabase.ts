import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// 👇 Ask your friend for these values
// const SUPABASE_URL = 'https://vhmmhnbzmsbrbrlfqnyz.supabase.co';
const SUPABASE_URL = "https://oqdpwtyjbgzufeblrnww.supabase.co";
// const SUPABASE_ANON_KEY = 'sb_publishable_Q95gjKTeyBkPj-df79a9LQ_5DStTKXI';
const SUPABASE_ANON_KEY = "sb_publishable_O_uy5g170K9G0w9zWBLCCQ_ZCp2o3x4"; // Friend gives this

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
