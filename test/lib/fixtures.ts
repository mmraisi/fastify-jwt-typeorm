import { faker } from '@faker-js/faker'
import { DataSource } from 'typeorm'
import { Users } from '../../src/database/entities/Users.entity'
import { hashPassword } from '../../src/lib/auth'

export const registerUser = async (
  contexts: { db: DataSource },
  options: any = {}
) => {
  const { db } = contexts

  const hashedPassword = await hashPassword(
    options?.userPassword ?? faker.lorem.word(10)
  )

  const usersRepository = db.getRepository(Users)

  const newUser = usersRepository.create({
    user_email: options?.userEmail ?? `${faker.lorem.word(10)}@example.com`,
    user_first_name: options?.userFirstName ?? faker.lorem.word(10),
    user_last_name: options?.userLastName ?? faker.lorem.word(10),
    user_password: hashedPassword
  })

  const user = await usersRepository.save(newUser)

  return user
}
