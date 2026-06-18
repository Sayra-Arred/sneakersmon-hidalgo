// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { db } from './db'

const ALGORITHM = 'aes-256-gcm'

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) throw new Error('ENCRYPTION_KEY is not set')
  return Buffer.from(key, 'hex')
}

export function encrypt(text: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey()
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

let ratelimit: Ratelimit | null = null

export function getRatelimit(
  requests = 10,
  window = '10 s'
): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null
  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(requests, window as Parameters<typeof Ratelimit.slidingWindow>[1]),
      analytics: true,
      prefix: 'sneakersmon_rl',
    })
  }
  return ratelimit
}

export function getIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  return (forwarded?.split(',')[0] ?? real ?? '127.0.0.1').trim()
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/script/gi, '')
    .trim()
}

export async function checkRateLimit(
  request: Request,
  identifier?: string
): Promise<{ success: boolean; limit: number; remaining: number }> {
  const rl = getRatelimit()
  if (!rl) return { success: true, limit: 100, remaining: 100 }
  const ip = identifier ?? getIP(request)
  const result = await rl.limit(ip)
  return { success: result.success, limit: result.limit, remaining: result.remaining }
}

export async function createAuditLog(params: {
  userId?: string
  action: string
  entity: string
  entityId?: string
  changes?: Record<string, unknown>
  ip?: string
  userAgent?: string
}): Promise<void> {
  await db.adminAuditLog.create({
    data: {
      ...params,
      changes: params.changes as object | undefined,
    },
  })
}
