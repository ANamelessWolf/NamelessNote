import { Button, Stack, TextField } from '@mui/material'
import AuthLayout from '../components/layouts/AuthLayout'

export default function LoginView({ onLogin }) {
  return (
    <AuthLayout>
      <Stack spacing={2}>
        <TextField size="small" label="Email" type="email" />
        <TextField size="small" label="Password" type="password" />
        <Button variant="contained" onClick={onLogin}>
          Login
        </Button>
      </Stack>
    </AuthLayout>
  )
}
