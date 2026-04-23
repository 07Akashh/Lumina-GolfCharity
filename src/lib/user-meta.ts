import { cookies } from 'next/headers'

export interface UserMeta {
  name: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  livesImpacted?: number;
  contributionPercentage?: number;
}

const COOKIE_NAME = 'lumina_user_meta'

/**
 * SERVER SIDE: Set user metadata in cookie
 */
export async function setUserMetaServer(meta: UserMeta) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, JSON.stringify(meta), {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

/**
 * SERVER SIDE: Get user metadata from cookie
 */
export async function getUserMetaServer(): Promise<UserMeta | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(COOKIE_NAME)
  if (!cookie) return null
  try {
    return JSON.parse(cookie.value)
  } catch {
    return null
  }
}

/**
 * SERVER SIDE: Clear user metadata
 */
export async function clearUserMetaServer() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

/**
 * CLIENT SIDE: Get user metadata (Simple parser)
 */
export function getUserMetaClient(): UserMeta | null {
  if (typeof document === 'undefined') return null
  const name = COOKIE_NAME + "="
  const decodedCookie = decodeURIComponent(document.cookie)
  const ca = decodedCookie.split(';')
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) === 0) {
      try {
        return JSON.parse(c.substring(name.length, c.length))
      } catch {
        return null
      }
    }
  }
  return null
}
