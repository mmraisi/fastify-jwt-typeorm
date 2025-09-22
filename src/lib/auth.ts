import bcrypt from 'bcryptjs'
import { JWT } from '@fastify/jwt'

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)
  return hash
}

export const bypassRoutes = ['register', 'login']

export const createAccessToken = (jwt: JWT, data: object) => {
  data = {
    ...data,
    aud: process.env.COOKIE_DOMAIN
  }

  return jwt.sign(data, {
    expiresIn: '7d'
  })
}
