import { post } from './http'

export async function loginWithGoogleCredential(credential) {
  const json = await post('/auth/google', { credential })
  return json?.data ?? null
}
