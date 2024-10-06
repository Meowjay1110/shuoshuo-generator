import jwt from 'jsonwebtoken'

const AUTH_SECRET = process.env.AUTH_SECRET || 'your-secret-key'

export function generateToken(username: string): string {
  return jwt.sign({ username }, AUTH_SECRET, { expiresIn: '1h' })
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false
  try {
    jwt.verify(token, AUTH_SECRET)
    return true
  } catch (error) {
    return false
  }
}