import { Add } from '@mui/icons-material'
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { useState } from 'react'
import PropertyRow from './PropertyRow'

export default function PropertiesGrid({
  groupName,
  properties,
  onAddProperty,
  onDeleteProperty,
  onUpdateProperty
}) {
  const [showNewField, setShowNewField] = useState(false)
  const [newName, setNewName] = useState('')
  const [newValue, setNewValue] = useState('')

  const resetNewField = () => {
    setShowNewField(false)
    setNewName('')
    setNewValue('')
  }

  const saveNewProperty = () => {
    if (!newName.trim() || !newValue.trim()) return
    onAddProperty({
      name: newName.trim(),
      value: newValue.trim()
    })
    resetNewField()
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 1.5 }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Main Content
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {groupName}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => setShowNewField(true)}
        >
          Agregar nueva columna
        </Button>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 2fr' },
          gap: 1.5,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="caption" fontWeight={700}>
          Nombre de propiedad
        </Typography>
        <Typography variant="caption" fontWeight={700}>
          Valor de propiedad
        </Typography>
      </Box>

      {properties.map((property) => (
        <PropertyRow
          key={property.id}
          property={property}
          onDelete={onDeleteProperty}
          onSave={onUpdateProperty}
        />
      ))}

      {showNewField && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 2fr' },
            gap: 1.5,
            py: 1.5
          }}
        >
          <TextField
            size="small"
            label="Nombre"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Stack spacing={1}>
            <TextField
              size="small"
              label="Valor"
              multiline
              minRows={3}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
            />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={saveNewProperty}>
                Guardar
              </Button>
              <Button variant="text" color="inherit" onClick={resetNewField}>
                Cancelar
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}
    </Box>
  )
}
