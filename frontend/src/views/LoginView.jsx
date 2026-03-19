import { Button, Stack, TextField } from '@mui/material'
import { getStrings } from '../assets/strings'
import AuthLayout from '../components/layouts/AuthLayout'

export default function LoginView({ language, onLogin }) {
  const texts = getStrings(language)

  return (
    <AuthLayout subtitle={texts.login.subtitle}>
      <Stack spacing={2}>
        <TextField size="small" label={texts.login.email} type="email" />
        <TextField size="small" label={texts.login.password} type="password" />
        <Button variant="contained" onClick={onLogin}>
          {texts.login.submit}
        </Button>
      </Stack>
    </AuthLayout>
  )
}
