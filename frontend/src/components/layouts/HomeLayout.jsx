import { Box, Button, Container, Grid2, Paper, Typography } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import FooterInfo from '../common/FooterInfo'

export default function HomeLayout({
  title,
  sidebar,
  content,
  onLogout
}) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container sx={{ py: 2, flex: 1 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<LogoutIcon />}
              onClick={onLogout}
            >
              Salir
            </Button>
          </Box>
        </Paper>

        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2, height: '100%' }}>{sidebar}</Paper>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 2, height: '100%' }}>{content}</Paper>
          </Grid2>
        </Grid2>
      </Container>
      <FooterInfo />
    </Box>
  )
}
