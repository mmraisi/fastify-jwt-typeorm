import { FastifyRequest, FastifyReply } from 'fastify'
import Problem from 'api-problem'
import { buildApiErrorCode, CustomApiErrors } from '../../lib/error-handler'
import bcrypt from 'bcryptjs'
import { Users } from '../../database/entities/Users.entity'
import { createAccessToken } from '../../lib/auth'
import { IFastify } from '../../../@types/fastify'

export const login = async (
  request: FastifyRequest,
  reply: FastifyReply,
  fastify: IFastify
) => {
  const { log, db, jwt } = fastify

  const body = request.body as { user_email: string, user_password: string }

  log.info('Attempting to log in')

  const usersRepository = db.getRepository(Users)

  // check if the email already exists
  const user = await usersRepository.findOne({
    where: {
      user_email: body?.user_email
    }
  })

  if (user == null) {
    throw new Problem(401, {
      code: buildApiErrorCode('user', CustomApiErrors.ERR_UNAUTHORIZED),
      context: {
        user_email: body?.user_email
      }
    })
  }

  // Compare the provided password with the hashed password stored in the database
  const isPasswordValid = await bcrypt.compare(
    body.user_password,
    user.user_password
  )

  if (!isPasswordValid) {
    // If password is incorrect, return 401 Unauthorized
    throw new Problem(401, {
      code: buildApiErrorCode('user', CustomApiErrors.ERR_UNAUTHORIZED),
      context: {
        user_email: body?.user_email
      }
    })
  }

  const accessToken = createAccessToken(jwt, {
    user_id: user?.user_id,
    user_email: user?.user_email
  })

  // Password is correct, return success response
  return await reply.code(200).header('Content-Type', 'application/json').send({
    user_id: user?.user_id,
    access_token: accessToken
  })
}
