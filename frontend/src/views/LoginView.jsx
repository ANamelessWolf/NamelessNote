import { Alert, CircularProgress, Stack } from '@mui/material'
import { GoogleLogin } from '@react-oauth/google'
import { useState } from 'react'
import { getStrings } from '../assets/strings'
import { loginWithGoogleCredential } from '../api/auth'
import AuthLayout from '../components/layouts/AuthLayout'

export default function LoginView({ language, onLogin }) {
  const texts = getStrings(language)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()

  const handleGoogleSuccess = async (response) => {
    const credential = response?.credential
    if (!credential) {
      setErrorMessage(texts.login.googleMissingCredential)
      return
    }

      const payload = JSON.parse(atob(credential.split('.')[1]))
      console.log('Google JWT payload:', payload)

    try {
      setIsSubmitting(true)
      setErrorMessage('')
      const session = await loginWithGoogleCredential(credential)
      if (!session?.accessToken) {
        throw new Error(texts.login.googleSessionError)
      }
      onLogin(session.accessToken)
    } catch (error) {
      setErrorMessage(error.message || texts.login.googleSessionError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout subtitle={texts.login.subtitle}>
      <Stack spacing={2}>
        {!googleClientId ? (
          <Alert severity="warning">{texts.login.googleClientIdMissing}</Alert>
        ) : null}
        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
        {isSubmitting ? (
          <Stack alignItems="center" py={1}>
            <CircularProgress size={28} />
          </Stack>
        ) : null}
        {googleClientId ? (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setErrorMessage(texts.login.googleCancelled)}
            useOneTap={false}
            theme="outline"
            size="large"
            shape="pill"
            text="signin_with"
            width="360"
          />
        ) : null}
      </Stack>
    </AuthLayout>
  )
}
