import { Avatar, Box, Chip, Container, Stack, Typography } from '@mui/material'
import profileImage from '../../assets/img/profile.jpg'

export default function FooterInfo({ texts }) {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        mt: 2,
        backgroundColor: 'background.paper',
        color: 'black'
      }}
    >
      <Container>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Box sx={{ minWidth: { sm: 92 } }}>
            <Avatar
              src={profileImage}
              alt={texts.name}
              sx={{ width: 82, height: 82, mb: 0.75, border: '2px solid rgba(255,255,255,0.18)' }}
            />
            <Typography variant="caption" sx={{ color: 'black' }}>
              {texts.credit}
            </Typography>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.1 }}>
              {texts.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'black', mb: 1.25 }}>
              {texts.email}
            </Typography>

            <Box
              sx={{
                color: 'black',
                display: 'inline-block',
                maxWidth: '100%'
              }}
            >
              <Typography variant="body1" sx={{ lineHeight: 1.35 }}>
                {texts.description}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
