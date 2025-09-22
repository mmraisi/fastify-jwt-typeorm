import { describe, it, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import sinon from 'sinon'
import { FastifyRequest } from 'fastify'
import { Users } from '../../../../src/database/entities/Users.entity'
import { buildMockFastify, buildMockReply } from '../../../lib/mocks'
import { hashPassword } from '../../../../src/lib/auth'
import { login } from '../../../../src/routes/users/login'
import {
  buildApiErrorCode,
  CustomApiErrors
} from '../../../../src/lib/error-handler'

describe('Login Route Tests', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('Login with valid credentials', async () => {
    const request = {} as FastifyRequest
    const reply = buildMockReply()
    const fastify = buildMockFastify()
    const logInfoStub = fastify.log.info

    const userPayload = {
      user_email: 'test@example.com',
      user_password: 'password123'
    }
    request.body = userPayload

    const hashedPassword = await hashPassword(userPayload.user_password ?? '')

    const mockUser = {
      user_id: 1,
      user_email: 'test@example.com',
      user_password: hashedPassword
    }

    fastify.db.getRepository.withArgs(Users).returns({
      findOne: sinon.stub().resolves(mockUser)
    })

    await login(request as any, reply as any, fastify as any)

    sinon.assert.calledOnce(logInfoStub)
    sinon.assert.calledWith(reply.code, 200)
    sinon.assert.calledWith(reply.header, 'Content-Type', 'application/json')
    sinon.assert.calledWith(reply.send, {
      user_id: 1,
      access_token: 'access_token'
    })
  })

  it('Login with invalid credentials', async () => {
    const request = {} as FastifyRequest
    const reply = buildMockReply()
    const fastify = buildMockFastify()
    const logInfoStub = fastify.log.info

    const userPayload = {
      user_email: 'test@example.com',
      user_password: 'invalidPassword'
    }
    request.body = userPayload

    const mockUser = {
      user_id: 1,
      user_email: 'test@example.com',
      user_password:
        '$2b$10$0NpTNRV0JGgXtE0c7BqR1uWp4v0Kf7T4V3HY47dsgZvGtgf8eq9Ua'
    }

    fastify.db.getRepository.withArgs(Users).returns({
      findOne: sinon.stub().resolves(mockUser)
    })

    try {
      await login(request as any, reply as any, fastify as any)
    } catch (error: any) {
      // Assert that logInfoStub was called once with the expected message
      sinon.assert.calledOnce(logInfoStub)

      // Assert that error status equals 401
      assert.strictEqual(error.status, 401)

      // Assert that error code includes the expected API error code
      assert(
        error.code.includes(
          buildApiErrorCode('user', CustomApiErrors.ERR_UNAUTHORIZED)
        )
      )

      // Assert that error context is deeply equal to the expected object
      assert.deepStrictEqual(error.context, {
        user_email: userPayload.user_email
      })
    }
  })

  it('Should throw an error for user not found', async () => {
    const request = {} as FastifyRequest
    const reply = buildMockReply()
    const fastify = buildMockFastify()
    const logInfoStub = fastify.log.info

    const userPayload = {
      user_email: 'test@example.com',
      user_password: 'invalidPassword'
    }
    request.body = userPayload

    fastify.db.getRepository.withArgs(Users).returns({
      findOne: sinon.stub().resolves(undefined)
    })

    try {
      await login(request as any, reply as any, fastify as any)
    } catch (error: any) {
      sinon.assert.calledOnce(logInfoStub)

      // Assert that error status equals 401
      assert.strictEqual(error.status, 401)

      // Assert that error code includes the expected API error code
      assert(
        error.code.includes(
          buildApiErrorCode('user', CustomApiErrors.ERR_UNAUTHORIZED)
        )
      )

      // Assert that error context is deeply equal to the expected object
      assert.deepStrictEqual(error.context, {
        user_email: userPayload.user_email
      })
    }
  })
})
