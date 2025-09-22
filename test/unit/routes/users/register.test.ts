import { beforeEach, describe, it, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import sinon from 'sinon'
import { FastifyRequest, FastifyReply } from 'fastify'
import { register } from '../../../../src/routes/users/register'
import { Users } from '../../../../src/database/entities/Users.entity'
import { buildMockFastify, buildMockReply } from '../../../lib/mocks'
import {
  buildApiErrorCode,
  CustomApiErrors
} from '../../../../src/lib/error-handler'

describe('register new user', () => {
  let request: FastifyRequest
  let reply: any
  let fastify: any
  let logInfoStub: sinon.SinonStub

  beforeEach(() => {
    request = {} as FastifyRequest
    reply = buildMockReply()
    fastify = buildMockFastify()
    logInfoStub = fastify.log.info as sinon.SinonStub
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should successfully register a new user', async () => {
    const newUser: Partial<Users> = {
      user_email: 'test@example.com',
      user_password: 'hashedPassword',
      user_first_name: 'John',
      user_last_name: 'Doe'
    }

    request.body = newUser

    const usersRepositorySaveStub = sinon.stub().resolves(newUser)

    fastify.db.getRepository = sinon.stub().returns({
      findOne: sinon.stub().resolves(null),
      create: sinon.stub().returns(newUser),
      save: usersRepositorySaveStub
    })

    await register(request, reply as FastifyReply, fastify)

    assert(logInfoStub.calledOnce)
    assert(reply.code.calledOnceWith(201))
    assert(reply.header.calledOnceWith('Content-Type', 'application/json'))
    assert(reply.send.calledOnce)
    assert.strictEqual(
      reply.send.firstCall.args[0].user_email,
      'test@example.com'
    )
    assert(usersRepositorySaveStub.calledOnceWith(newUser))
  })

  it('should return 409 Conflict if user already exists', async () => {
    const existingUser: Partial<Users> = {
      user_email: 'test@example.com',
      user_password: 'hashedPassword',
      user_first_name: 'John',
      user_last_name: 'Doe'
    }

    request.body = existingUser
    fastify.db.getRepository = sinon.stub().returns({
      findOne: sinon.stub().resolves(existingUser)
    })

    try {
      await register(request, reply as FastifyReply, fastify)
    } catch (error: any) {
      assert.strictEqual(error.status, 409)
      assert(
        error.code.includes(
          buildApiErrorCode('email', CustomApiErrors.ERR_ALREADY_EXISTS)
        )
      )
      assert.deepStrictEqual(error.context, { email: existingUser.user_email })
    }
  })
})
