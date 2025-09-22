import { getUser } from './users/get'
import { login } from './users/login'
import { register } from './users/register'
import { updateUser } from './users/update'

export const handler = {
  register,
  login,
  'user-get': getUser,
  'user-update': updateUser
}
