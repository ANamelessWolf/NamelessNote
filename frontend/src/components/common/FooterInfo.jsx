import { Box, Container, Typography } from '@mui/material'

export default function FooterInfo({ texts }) {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        mt: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }}
    >
      <Container>
        <Typography variant="subtitle2" fontWeight={700}>
          {texts.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {texts.description}
        </Typography>
      </Container>
    </Box>
  )
}
