import { FastifyReply } from 'fastify'
import { IFastify, TFastifyRequest } from '../../../@types/fastify'
import { Users } from '../../database/entities/Users.entity'
import Problem from 'api-problem'
import { buildApiErrorCode, CustomApiErrors } from '../../lib/error-handler'

export const updateUser = async (
  request: TFastifyRequest,
  reply: FastifyReply,
  fastify: IFastify
) => {
  const { log, db } = fastify

  let { user_id: userId } = request?.user ?? {}

  if (!userId) {
    userId = (request?.params as { user_id: string })?.user_id
  }

  const { body } = request as { body: Users }

  log.info(`Attempting to update userId - ${userId}`)

  const usersRepository = db.getRepository(Users)

  // check if the user does not exists
  const user = await usersRepository.findOne({
    where: {
      user_id: userId
    }
  })

  if (user == null) {
    throw new Problem(404, {
      code: buildApiErrorCode('user', CustomApiErrors.ERR_NOT_FOUND),
      context: {
        user_id: userId
      }
    })
  }

  await usersRepository.update(userId, {
    ...body
  })

  const res = await usersRepository.findOne({
    where: { user_id: userId }
  })

  return await reply.code(200).header('Content-Type', 'application/json').send(res)
}
