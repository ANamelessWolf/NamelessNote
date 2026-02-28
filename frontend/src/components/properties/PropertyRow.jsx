import {
  ContentCopy,
  Delete,
  Edit,
  ExpandLess,
  ExpandMore,
  Save,
  Visibility,
  VisibilityOff
} from '@mui/icons-material'
import {
  Box,
  Collapse,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import RichTextEditor from '../common/RichTextEditor'
import { sanitizeRichText } from '../../utils/sanitizeRichText'

const stripHtml = (value) => value.replace(/<[^>]+>/g, '').trim()
const hasRichHtml = (value) => /<\/?[a-z][^>]*>/i.test(value || '')

export default function PropertyRow({ property, onDelete, onSave }) {
  const [expanded, setExpanded] = useState(false)
  const [showValue, setShowValue] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(property.valueHtml)

  useEffect(() => {
    setDraft(property.valueHtml)
  }, [property.valueHtml])

  const plainText = useMemo(
    () => property.valueText || stripHtml(property.valueHtml || ''),
    [property.valueText, property.valueHtml]
  )
  const isPlainTextValue = useMemo(
    () => !hasRichHtml(property.valueHtml),
    [property.valueHtml]
  )
  const previewText = useMemo(
    () => (plainText.length > 42 ? `${plainText.slice(0, 42)}...` : plainText),
    [plainText]
  )

  const copyPlainText = async () => {
    await navigator.clipboard.writeText(plainText)
  }

  const saveEdit = () => {
    onSave(property.id, sanitizeRichText(draft))
    setIsEditing(false)
  }

  return (
    <>
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
        <Typography variant="body2" fontWeight={700}>
          {property.name}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          {isPlainTextValue ? (
            <>
              <TextField
                size="small"
                fullWidth
                value={showValue ? previewText : plainText}
                type={showValue ? 'text' : 'password'}
                InputProps={{ readOnly: true }}
              />
              <Tooltip title="Copiar">
                <IconButton onClick={copyPlainText}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : null}
          <Tooltip title={expanded ? 'Ocultar' : 'Ver'}>
            <IconButton onClick={() => setExpanded((v) => !v)}>
              {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </IconButton>
          </Tooltip>
          {isPlainTextValue ? (
            <Tooltip title={showValue ? 'Ocultar valor' : 'Mostrar valor'}>
              <IconButton onClick={() => setShowValue((v) => !v)}>
                {showValue ? (
                  <VisibilityOff fontSize="small" />
                ) : (
                  <Visibility fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          {isEditing ? (
            <RichTextEditor
              label="Rich text"
              value={draft}
              minRows={4}
              onChange={setDraft}
            />
          ) : (
            <Box
              sx={{
                p: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word'
              }}
              dangerouslySetInnerHTML={{ __html: property.valueHtml }}
            />
          )}

          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            {isEditing ? (
              <IconButton color="primary" onClick={saveEdit}>
                <Save />
              </IconButton>
            ) : (
              <IconButton color="primary" onClick={() => setIsEditing(true)}>
                <Edit />
              </IconButton>
            )}
            <IconButton color="error" onClick={() => onDelete(property.id)}>
              <Delete />
            </IconButton>
          </Stack>
        </Box>
      </Collapse>
    </>
  )
}
