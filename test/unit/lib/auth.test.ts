import sinon, { SinonStub } from 'sinon'
import { afterEach, beforeEach, describe, it } from 'node:test'
import bcrypt from 'bcryptjs'
import { hashPassword } from '../../../src/lib/auth'
import assert from 'node:assert/strict'

describe('hashPassword function', () => {
  let genSaltStub: SinonStub
  let hashStub: SinonStub

  beforeEach(() => {
    // Create Sinon stubs for bcrypt functions
    genSaltStub = sinon.stub(bcrypt, 'genSalt')
    hashStub = sinon.stub(bcrypt, 'hash')
  })

  afterEach(() => {
    // Restore the original implementations after each test
    genSaltStub.restore()
    hashStub.restore()
  })

  it('should hash the password using bcrypt', async () => {
    const password = 'testPassword'

    // Configure Sinon stubs to return expected values
    genSaltStub.resolves('mockedSalt')
    hashStub.resolves('mockedHash')

    const hashedPassword = await hashPassword(password)

    // Ensure bcrypt functions are called with correct arguments

    assert.ok(genSaltStub.calledOnceWith(10))
    assert.ok(hashStub.calledOnceWith(password, 'mockedSalt'))

    // Ensure the correct hashed password is returned
    assert(hashedPassword, 'mockedHash')
  })

  it('should handle errors from bcrypt functions', async () => {
    const password = 'testPassword'
    const expectedError = new Error('bcrypt error')

    // Configure genSalt to reject with an error
    genSaltStub.rejects(expectedError)

    // Ensure the function throws the expected error
    try {
      await hashPassword(password)
    } catch (error) {
      // Ensure the error matches the expected error
      assert.strictEqual(error, expectedError)

      // Ensure hash function is not called when genSalt fails
      sinon.assert.notCalled(hashStub)
    }
  })
})
