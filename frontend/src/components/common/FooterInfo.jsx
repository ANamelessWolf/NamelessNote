import { Avatar, Box, Container, Link, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import profileImage from '../../assets/img/profile.jpg'

export default function FooterInfo({ texts, currentUser }) {
  const displayName = currentUser?.name || texts.name
  const displayEmail = currentUser?.email || texts.email
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [currentUser?.picture])

  const displayAvatar = !imageFailed && currentUser?.picture ? currentUser.picture : profileImage
  const initials = useMemo(() => {
    const parts = String(displayName || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)

    return parts.map((part) => part[0]?.toUpperCase() || '').join('') || '?'
  }, [displayName])

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
              src={displayAvatar}
              alt={displayName}
              imgProps={{
                referrerPolicy: 'no-referrer',
                onError: () => setImageFailed(true)
              }}
              sx={{ width: 82, height: 82, mb: 0.75, border: '2px solid rgba(255,255,255,0.18)' }}
            >
              {initials}
            </Avatar>
            <Link
              href={texts.url}
              target="_blank"
              rel="noreferrer"
              underline="hover"
              variant="caption"
              sx={{ color: 'blue' }}
            >
              {texts.credit}
            </Link>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.1 }}>
              {displayName}
            </Typography>
            <Typography variant="body2" sx={{ color: 'black', mb: 1.25 }}>
              {displayEmail}
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
