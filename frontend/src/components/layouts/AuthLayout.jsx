import { Box, Paper, Typography } from '@mui/material'

export default function AuthLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background:
          'linear-gradient(135deg, rgba(12,109,99,0.15) 0%, rgba(243,156,18,0.12) 100%)'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 3
        }}
      >
        <Typography variant="h5" fontWeight={700} gutterBottom>
          NamelessNote
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Inicia sesion para administrar tus grupos y propiedades.
        </Typography>
        {children}
      </Paper>
    </Box>
  )
}
