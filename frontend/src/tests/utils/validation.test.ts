import { validateSignUp } from '../../utils/validation'

describe('validateSignUp', () => {
  it('returns error when email is empty', () => {
    expect(validateSignUp('', 'password123', 'password123')).toBe('Email is required')
  })

  it('returns error when password is shorter than 8 characters', () => {
    expect(validateSignUp('user@test.com', 'short', 'short')).toBe(
      'Password must be at least 8 characters',
    )
  })

  it('returns error when passwords do not match', () => {
    expect(validateSignUp('user@test.com', 'password123', 'different456')).toBe(
      'Passwords do not match',
    )
  })

  it('returns null when all inputs are valid', () => {
    expect(validateSignUp('user@test.com', 'password123', 'password123')).toBeNull()
  })
})
