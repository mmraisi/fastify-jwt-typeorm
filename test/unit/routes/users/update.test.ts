import { beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildMockFastify, buildMockReply } from '../../../lib/mocks'
import { Users } from '../../../../src/database/entities/Users.entity'
import sinon from 'sinon'
import { updateUser } from '../../../../src/routes/users/update'
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
      },
      body: {
        user_first_name: 'John',
        user_last_name: 'Smith'
      }
    }
    reply = buildMockReply()
  })

  it('should update user by user_id and return it if found', async () => {
    const mockUser = {
      user_id: userId,
      user_email: 'john@example.com',
      user_first_name: 'John',
      user_last_name: 'Doe',
      date_created: '2024-04-08T06:33:55.426Z',
      date_updated: '2024-04-08T06:33:55.426Z'
    }
    fastify.db.getRepository.withArgs(Users).returns({
      findOne: sinon.stub().resolves({ ...mockUser, ...request.body }),
      update: sinon.stub().resolves()
    })

    await updateUser(request, reply, fastify)

    sinon.assert.calledOnce(fastify.log.info)
    sinon.assert.calledWith(reply.code, 200)
    sinon.assert.calledWith(reply.header, 'Content-Type', 'application/json')

    assert.strictEqual(reply.send.firstCall.args[0].user_last_name, 'Smith')

    sinon.assert.calledWith(reply.send, { ...mockUser, ...request.body })
  })

  it('should throw 404 error if user is not found', async () => {
    fastify.db.getRepository.withArgs(Users).returns({
      findOne: sinon.stub().resolves(undefined)
    })

    try {
      await updateUser(request, reply, fastify)
    } catch (error: any) {
      sinon.assert.calledOnce(fastify.log.info)

      assert.strictEqual(error.status, 404)
      assert(
        error.code.includes(
          buildApiErrorCode('user', CustomApiErrors.ERR_NOT_FOUND)
        )
      )
      assert.deepStrictEqual(error.context, { user_id: userId })
    }
  })
})
