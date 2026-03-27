import axios from 'axios'
import prisma from './src/config/db'

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function testAuth() {
  console.log('Testing Auth Flow...')

  // Wait briefly for server to be ready
  await sleep(1000)

  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    name: 'Test User',
  }

  try {
    console.log('1. Registering new user...')
    const regRes = await axios.post(
      'http://localhost:5000/api/auth/register',
      testUser,
    )
    console.log('✅ Registration successful.')
    console.log(`Received Token: ${regRes.data.token.substring(0, 20)}...`)

    console.log('2. Trying duplicate registration...')
    try {
      await axios.post('http://localhost:5000/api/auth/register', testUser)
      console.log('❌ Should have failed duplicate registration.')
    } catch (err: any) {
      if (err.response?.status === 409) {
        console.log('✅ Duplicate registration caught correctly (409).')
      } else {
        console.log('❌ Unexpected error on dup:', err.response?.status)
      }
    }

    console.log('3. Logging in...')
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: testUser.email,
      password: testUser.password,
    })
    console.log('✅ Login successful.')

    console.log('4. Bad credentials login...')
    try {
      await axios.post('http://localhost:5000/api/auth/login', {
        email: testUser.email,
        password: 'wrongpassword',
      })
      console.log('❌ Should have failed login.')
    } catch (err: any) {
      if (err.response?.status === 401) {
        console.log('✅ Bad credentials caught correctly (401).')
      } else {
        console.log('❌ Unexpected error on bad creds:', err.response?.status)
      }
    }
  } catch (error: any) {
    console.error('Test script failed:', error?.response?.data || error.message)
  }

  process.exit(0)
}

testAuth()
