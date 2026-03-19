import { Add } from '@mui/icons-material'
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
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
  onUpdateProperty,
  texts,
  editorTexts
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isPortrait = useMediaQuery('(orientation: portrait)')
  const shouldHideColumnHeaders = isMobile && isPortrait
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
          {texts.addColumn}
        </Button>
      </Stack>

      {!shouldHideColumnHeaders ? (
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
            {texts.propertyName}
          </Typography>
          <Typography variant="caption" fontWeight={700}>
            {texts.propertyValue}
          </Typography>
        </Box>
      ) : null}

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
            label={texts.nameLabel}
            value={newName}
            error={isNewNameInvalid}
            helperText={isNewNameInvalid ? texts.invalidName : ''}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Stack spacing={1}>
            <RichTextEditor
              label={texts.valueLabel}
              value={newValue}
              minRows={3}
              onChange={setNewValue}
              texts={editorTexts}
            />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={saveNewProperty} disabled={!canSaveNewProperty}>
                {texts.save}
              </Button>
              <Button variant="text" color="inherit" onClick={resetNewField}>
                {texts.cancel}
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}

      {properties.map((property) => (
        <PropertyRow
          key={property.id}
          property={property}
          onDelete={onDeleteProperty}
          onSave={onUpdateProperty}
          texts={texts}
          editorTexts={editorTexts}
        />
      ))}
    </Box>
  )
}
