import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import { supportedLanguages } from '../assets/strings'
import { getDefaultAppConfig } from '../utils/appConfig'

const defaultConfig = getDefaultAppConfig()

export default function ConfigView({ config, onBack, onSave }) {
  const [form, setForm] = useState(config)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setForm(config)
  }, [config])

  const handleChange = (field) => (event) => {
    setSaved(false)
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(form)
    setSaved(true)
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4, bgcolor: 'background.default' }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 3 }}>
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2
              }}
            >
              <Typography variant="h5" fontWeight={700}>
                Configuracion
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={onBack}
              >
                Volver
              </Button>
            </Box>

            <TextField
              select
              label="Idioma"
              value={form.language}
              onChange={handleChange('language')}
              fullWidth
            >
              {supportedLanguages.map((language) => (
                <MenuItem key={language} value={language}>
                  {language.toUpperCase()}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="API URL"
              value={form.apiBaseUrl}
              onChange={handleChange('apiBaseUrl')}
              placeholder={defaultConfig.apiBaseUrl}
              fullWidth
            />

            <Typography variant="body2" color="text.secondary">
              Estos valores se guardan en localStorage y sobreescriben los definidos en .env.
            </Typography>

            {saved ? <Alert severity="success">Configuracion guardada.</Alert> : null}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
                Guardar
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}
