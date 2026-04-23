/**
 * LUMINA PLAN LIMITS
 * Single source of truth for all subscription tier features and constraints.
 * Used server-side (actions) and client-side (UI gating).
 */

export type PlanId = 'free' | 'ethereal' | 'apex' | 'luminary'

export interface PlanLimits {
  /** Human-readable label */
  label: string
  /** Max active score nodes a user can hold simultaneously */
  maxScoreNodes: number
  /** Max monthly draw entries */
  maxDrawEntries: number
  /** Access to impact metrics / analytics page */
  analyticsAccess: boolean
  /** Access to portfolio / giving ledger page */
  portfolioAccess: boolean
  /** Access to VIP draws */
  vipDrawAccess: boolean
  /** Dedicated impact advisor */
  dedicatedAdvisor: boolean
  /** Advisory board access */
  advisoryBoard: boolean
  /** Tax efficiency report */
  taxReport: boolean
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    label: 'Free',
    maxScoreNodes: 0,
    maxDrawEntries: 0,
    analyticsAccess: false,
    portfolioAccess: false,
    vipDrawAccess: false,
    dedicatedAdvisor: false,
    advisoryBoard: false,
    taxReport: false,
  },
  ethereal: {
    label: 'Ethereal',
    maxScoreNodes: 5,
    maxDrawEntries: 5,
    analyticsAccess: true,
    portfolioAccess: true,
    vipDrawAccess: false,
    dedicatedAdvisor: false,
    advisoryBoard: false,
    taxReport: false,
  },
  apex: {
    label: 'Apex',
    maxScoreNodes: 25,
    maxDrawEntries: 25,
    analyticsAccess: true,
    portfolioAccess: true,
    vipDrawAccess: true,
    dedicatedAdvisor: true,
    advisoryBoard: false,
    taxReport: true,
  },
  luminary: {
    label: 'Luminary',
    maxScoreNodes: 100,
    maxDrawEntries: 100,
    analyticsAccess: true,
    portfolioAccess: true,
    vipDrawAccess: true,
    dedicatedAdvisor: true,
    advisoryBoard: true,
    taxReport: true,
  },
}

/** Safely resolve a DB plan string to a typed PlanId */
export function resolvePlan(plan: string | null | undefined): PlanId {
  if (plan && plan in PLAN_LIMITS) return plan as PlanId
  return 'free'
}

/** Get limits for a given plan string from the DB */
export function getLimits(plan: string | null | undefined): PlanLimits {
  return PLAN_LIMITS[resolvePlan(plan)]
}
