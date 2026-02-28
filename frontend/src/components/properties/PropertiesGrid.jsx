import { Add } from '@mui/icons-material'
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { useState } from 'react'
import RichTextEditor from '../common/RichTextEditor'
import { sanitizeRichText } from '../../utils/sanitizeRichText'
import PropertyRow from './PropertyRow'

const PROP_NAME_REGEX = /^[A-Za-z0-9\s_\-\[\]]{1,25}$/

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
  const trimmedNewName = newName.trim()
  const isNewNameValid = PROP_NAME_REGEX.test(trimmedNewName)
  const isNewNameInvalid = trimmedNewName.length > 0 && !isNewNameValid
  const canSaveNewProperty =
    Boolean(trimmedNewName) && isNewNameValid && Boolean(newValue.trim())

  const resetNewField = () => {
    setShowNewField(false)
    setNewName('')
    setNewValue('')
  }

  const saveNewProperty = () => {
    if (!canSaveNewProperty) return
    const sanitizedValue = sanitizeRichText(newValue)
    if (!sanitizedValue) return
    onAddProperty({
      name: trimmedNewName,
      value: sanitizedValue
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
            error={isNewNameInvalid}
            helperText={
              isNewNameInvalid
                ? 'Nombre invalido. Usa A-Z, 0-9, espacios, -, _, [, ] (1..25).'
                : ''
            }
            onChange={(e) => setNewName(e.target.value)}
          />
          <Stack spacing={1}>
            <RichTextEditor
              label="Valor"
              value={newValue}
              minRows={3}
              onChange={setNewValue}
            />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={saveNewProperty} disabled={!canSaveNewProperty}>
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
