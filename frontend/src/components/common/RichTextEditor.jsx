import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatUnderlined,
  Link as LinkIcon
} from '@mui/icons-material'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import { useEffect, useRef } from 'react'

const editorSx = {
  minHeight: 96,
  p: 1,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1,
  overflowY: 'auto',
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
  '&:focus': {
    outline: 'none',
    borderColor: 'primary.main',
    boxShadow: (theme) => `0 0 0 1px ${theme.palette.primary.main}`
  }
}

export default function RichTextEditor({
  label,
  value,
  onChange,
  minRows = 4
}) {
  const editorRef = useRef(null)

  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    if (el.innerHTML !== value) el.innerHTML = value || ''
  }, [value])

  const runCommand = (command, commandValue = null) => {
    document.execCommand(command, false, commandValue)
    const html = editorRef.current?.innerHTML || ''
    onChange(html)
    editorRef.current?.focus()
  }

  const addLink = () => {
    const url = window.prompt('URL')
    if (!url) return
    runCommand('createLink', url)
  }

  return (
    <Box>
      {label ? (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          {label}
        </Typography>
      ) : null}

      <Stack direction="row" spacing={0.5} sx={{ mb: 0.5 }}>
        <IconButton size="small" onClick={() => runCommand('bold')} title="Negrita">
          <FormatBold fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => runCommand('italic')} title="Cursiva">
          <FormatItalic fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => runCommand('underline')} title="Subrayado">
          <FormatUnderlined fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => runCommand('insertUnorderedList')}
          title="Lista"
        >
          <FormatListBulleted fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => runCommand('insertOrderedList')}
          title="Lista numerada"
        >
          <FormatListNumbered fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={addLink} title="Link">
          <LinkIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Box
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML || '')}
        sx={{
          ...editorSx,
          minHeight: `${Math.max(minRows, 2) * 24}px`
        }}
      />
    </Box>
  )
}
