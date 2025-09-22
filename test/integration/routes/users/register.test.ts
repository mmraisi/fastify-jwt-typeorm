import { afterEach, beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { faker } from '@faker-js/faker'
import { Users } from '../../../../src/database/entities/Users.entity'
import {
  createFastifyInstance,
  integrationTestMethods,
  TEST_DB_NAME
} from '../../../../src/database/testHarness/integration'
import { DataSource } from 'typeorm'

faker.seed(Math.floor(1_000_000_000 * Math.random()))

beforeEach(async (t: any) => {
  const testSetup = integrationTestMethods()
  t.context = {
    testSetup,
    testDataSource: await testSetup.beforeEach()
  }
})

afterEach(async (t: any) => {
  await t.context.testSetup.afterEach()
})

describe('POST /register', () => {
  it('201: should successfully register a new user', async (t: any) => {
    const { testDataSource } = t.context as { testDataSource: DataSource }

    const server = await createFastifyInstance({
      db: { overrideTestDbName: TEST_DB_NAME }
    })

    const newUser: Partial<Users> = {
      user_email: `${faker.lorem.word(10)}@example.com`,
      user_first_name: faker.lorem.word(10),
      user_last_name: faker.lorem.word(10),
      user_password: faker.lorem.word(10)
    }
    const response = await server.inject({
      method: 'POST',
      url: '/register',
      body: newUser
    })

    assert.deepStrictEqual(response.statusCode, 201)

    const body = await response.json()

    assert.deepStrictEqual(body.user_email, newUser?.user_email)
    assert.deepStrictEqual(body.user_first_name, newUser?.user_first_name)

    // check if the user created in the db

    const userRepo = testDataSource.getRepository(Users)
    const record = await userRepo.findOne({
      where: {
        user_email: newUser.user_email
      }
    })

    assert.deepStrictEqual(record?.user_id, body?.user_id)

    await server.close()
  })
})
