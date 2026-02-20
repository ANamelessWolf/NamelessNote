import { Box, Container, Typography } from '@mui/material'

export default function FooterInfo() {
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
          About
        </Typography>
        <Typography variant="body2" color="text.secondary">
          NamelessNote organiza propiedades de texto y valores sensibles de forma
          simple, editable y responsiva.
        </Typography>
      </Container>
    </Box>
  )
}
