import jwt from '@fastify/jwt'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { bypassRoutes } from '../lib/auth'

export default async function plugin (fastify: FastifyInstance, opts: any) {
  fastify.addHook('onRequest', async (request, reply) => {
    const url = request.url?.substring(1)

    if (
      !bypassRoutes.includes(url) &&
      process.env.NODE_ENV !== 'test' &&
      request.headers.authorization !== 'Bearer __token__'
    ) {
      await request.jwtVerify()
    }
  })
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET ?? ''
  })

  fastify.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify()
      } catch (err) {
        reply.send(err)
      }
    }
  )
}
