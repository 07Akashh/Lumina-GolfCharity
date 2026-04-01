'use server'

import { createClient } from '@/lib/supabase/server'

export async function logAuditAction(
  action: string, 
  entityType: string, 
  entityId: string | null = null, 
  details: Record<string, unknown> | string | null = null
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  const { error } = await supabase
    .from('audit_logs')
    .insert({
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details
    })

  if (error) {
    console.error('Audit log failed:', error)
  }
}
