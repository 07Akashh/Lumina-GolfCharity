import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const adminDb = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // 1. Create the claims table via RPC or just attempt a query to check
    // In a real environment, this should be a migration. 
    // Here we will use the admin client to ensure the bucket exists.
    
    const { data: bucket, error: bucketError } = await adminDb.storage.createBucket('claims-documents', {
      public: false,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'application/pdf'],
      fileSizeLimit: 26214400 // 25MB
    })

    if (bucketError && bucketError.message !== 'The resource already exists') {
       console.error('Bucket Error:', bucketError)
    }

    // Since we can't run raw SQL easily via the JS client without an RPC, 
    // we'll assume the user has the 'claims' table or we'll hint it.
    // However, I'll try to check if it exists:
    const { error: tableCheck } = await adminDb.from('claims').select('id').limit(1)
    
    let dbStatus = "Table 'claims' already exists."
    if (tableCheck && tableCheck.code === '42P01') {
       dbStatus = "Table 'claims' MISSING. Please run the SQL in the Dashboard."
    }

    return NextResponse.json({
      success: true,
      storage: bucketError ? 'Already exists' : 'Created successfully',
      database: dbStatus,
      sql_to_run: `
        CREATE TABLE IF NOT EXISTS public.claims (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            winner_id UUID REFERENCES public.winners(id) ON DELETE CASCADE,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            status TEXT DEFAULT 'draft',
            step INTEGER DEFAULT 1,
            identity_data JSONB DEFAULT '{}',
            banking_data JSONB DEFAULT '{}',
            impact_choice_id UUID REFERENCES public.charities(id),
            document_urls JSONB DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );
        ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
      `
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
