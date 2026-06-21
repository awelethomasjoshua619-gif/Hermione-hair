import crypto from 'crypto'
import { env } from '../config/env'

const ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16

export function encrypt(text: string): string {
  // Derive a 32-byte key from our environment variable
  const key = crypto.scryptSync(env.TOTP_ENCRYPTION_KEY, 'salt', 32)
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return `${iv.toString('hex')}:${encrypted}`
}

export function decrypt(text: string): string {
  try {
    const parts = text.split(':')
    const iv = Buffer.from(parts.shift()!, 'hex')
    const encryptedText = Buffer.from(parts.join(':'), 'hex')
    const key = crypto.scryptSync(env.TOTP_ENCRYPTION_KEY, 'salt', 32)
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
  } catch (err) {
    throw new Error('Decryption failed: Invalid key or corrupted data')
  }
}
