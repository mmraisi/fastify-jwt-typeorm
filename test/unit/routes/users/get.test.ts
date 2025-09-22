import { beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildMockFastify, buildMockReply } from '../../../lib/mocks'
import { Users } from '../../../../src/database/entities/Users.entity'
import sinon from 'sinon'
import { getUser } from '../../../../src/routes/users/get'
import {
  buildApiErrorCode,
  CustomApiErrors
} from '../../../../src/lib/error-handler'

describe('getUser API', () => {
  let fastify: any
  let request: any
  let reply: any
  const userId = 'bf7a7668-7c11-4b3f-8719-739659097e05'

  beforeEach(() => {
    fastify = buildMockFastify()
    request = {
      user: {
        user_id: userId
      }
    }
    reply = buildMockReply()
  })

  it('should fetch user by user_id and return it if found', async () => {
    const mockUser = {
      user_id: userId,
      user_email: 'john@example.com',
      user_first_name: 'John',
      user_last_name: 'Doe',
      date_created: '2024-04-08T06:33:55.426Z',
      date_updated: '2024-04-08T06:33:55.426Z'
    }
    fastify.db.getRepository.withArgs(Users).returns({
      findOne: sinon.stub().resolves(mockUser)
    })

    await getUser(request, reply, fastify)
    console.log(`Attempting to fetch userId - ${userId}`)

    sinon.assert.calledOnce(fastify.log.info)
    sinon.assert.calledWith(reply.code, 200)
    sinon.assert.calledWith(reply.header, 'Content-Type', 'application/json')
    sinon.assert.calledWith(reply.send, mockUser)
  })

  it('should throw 404 error if user is not found', async () => {
    fastify.db.getRepository.withArgs(Users).returns({
      findOne: sinon.stub().resolves(undefined)
    })

    try {
      await getUser(request, reply, fastify)
    } catch (error: any) {
      sinon.assert.calledWith(
        fastify.log.info,
        `Attempting to fetch user_id - ${userId}`
      )

      assert.ok(error.status, '404')
      assert(
        error.code.includes(
          buildApiErrorCode('user', CustomApiErrors.ERR_NOT_FOUND)
        )
      )

      assert.deepStrictEqual(error.context, {
        user_id: userId
      })
    }
  })
})
