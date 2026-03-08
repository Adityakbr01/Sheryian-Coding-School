import { useState } from 'react'

/**
 * Lightweight hook for auth form submissions.
 * Keeps loading/error state in one place so pages stay thin.
 *
 * @param {(data: object) => Promise<any>} apiFn  – the authApi method to call
 * @param {{ onSuccess?: (res: any) => void }} opts
 */
export default function useAuth(apiFn, { onSuccess } = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function submit(formData) {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFn(formData)
      onSuccess?.(res)
      return res
    } catch (err) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return { submit, loading, error }
}
