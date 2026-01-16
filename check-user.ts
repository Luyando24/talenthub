
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUser() {
  const email = process.argv[2]
  if (!email) {
    console.log('Usage: npx tsx check-user.ts <email>')
    process.exit(1)
  }

  console.log(`Checking for user: ${email}`)

  // 1. Check auth.users
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
  
  if (listError) {
    console.error('Error listing users:', listError)
    process.exit(1)
  }

  const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

  if (user) {
    console.log('✅ Found in auth.users:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Confirmed: ${user.email_confirmed_at}`)
    console.log(`   Metadata:`, user.user_metadata)

    // 2. Check public.profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
    
    if (profileError) {
        console.log('❌ Error querying profiles:', profileError.message)
    } else if (profiles && profiles.length > 0) {
        console.log(`✅ Found ${profiles.length} profile(s):`)
        console.log(profiles)
    } else {
        console.log('❌ Profile not found in public.profiles')
    }

    // 3. Check extended profiles
    const { data: recProfile } = await supabase.from('recruiter_profiles').select('*').eq('id', user.id).single()
    const { data: candProfile } = await supabase.from('candidate_profiles').select('*').eq('id', user.id).single()

    if (recProfile) console.log('✅ Found in recruiter_profiles:', recProfile)
    if (candProfile) console.log('✅ Found in candidate_profiles:', candProfile)

  } else {
    console.log('❌ Not found in auth.users')
  }
}

checkUser()
