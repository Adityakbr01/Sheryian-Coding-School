import api from '../../../utils/api'

const AUTH_BASE = '/auth'

const authApi = {
  /**
   * POST /api/v1/auth/register
   * @param {{ userName: string, email: string, password: string }} data
   */
  register(data) {
    return api.post(`${AUTH_BASE}/register`, data)
  },

  /**
   * POST /api/v1/auth/login
   * @param {{ email?: string, userName?: string, password: string }} data
   */
  login(data) {
    return api.post(`${AUTH_BASE}/login`, data)
  },
}

export default authApi
