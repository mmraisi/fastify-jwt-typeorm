import { afterEach, beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { faker } from '@faker-js/faker'
import {
  createFastifyInstance,
  integrationTestMethods,
  TEST_DB_NAME
} from '../../../../src/database/testHarness/integration'
import { DataSource } from 'typeorm'
import { registerUser } from '../../../lib/fixtures'

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

describe('POST /login', () => {
  it('201: should successfully login the user', async (t: any) => {
    const { testDataSource } = t.context as { testDataSource: DataSource }

    const server = await createFastifyInstance({
      db: { overrideTestDbName: TEST_DB_NAME }
    })

    // create a new user
    const newUser = await registerUser(
      { db: testDataSource },
      { userPassword: 'abc@123' }
    )

    const response = await server.inject({
      method: 'POST',
      url: '/login',
      body: {
        user_email: newUser.user_email,
        user_password: 'abc@123'
      }
    })

    assert.deepStrictEqual(response.statusCode, 200)

    const body = await response.json()

    assert.deepStrictEqual(body.user_id, newUser?.user_id)
    assert.deepStrictEqual(body?.access_token?.split('.')?.length, 3)

    await server.close()
  })
})
