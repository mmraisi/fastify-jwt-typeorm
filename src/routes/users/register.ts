import { FastifyRequest, FastifyReply } from 'fastify'
import { Users } from '../../database/entities/Users.entity'
import { hashPassword } from '../../lib/auth'
import Problem from 'api-problem'
import { buildApiErrorCode, CustomApiErrors } from '../../lib/error-handler'
import { IFastify } from '../../../@types/fastify'

export const register = async (
  request: FastifyRequest,
  reply: FastifyReply,
  fastify: IFastify
) => {
  const { log, db } = fastify

  const body = request.body as Users

  log.info('Attempting to register a new user')

  const usersRepository = db.getRepository(Users)

  // check if the email already exists
  const user = await usersRepository.findOne({
    where: {
      user_email: body?.user_email
    }
  })

  if (user != null) {
    throw new Problem(409, {
      code: buildApiErrorCode('email', CustomApiErrors.ERR_ALREADY_EXISTS),
      context: {
        email: body?.user_email
      }
    })
  }

  const hashedPassword = await hashPassword(body.user_password)

  const newUser = usersRepository.create({
    user_email: body.user_email,
    user_password: hashedPassword,
    user_first_name: body.user_first_name,
    user_last_name: body.user_last_name
  })

  const res = await usersRepository.save(newUser)

  return await reply.code(201).header('Content-Type', 'application/json').send(res)
}
