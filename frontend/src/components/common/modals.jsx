import React from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from '@mui/material'

export const ConfirmationModalType = Object.freeze({
  YesNo: 'YesNo',
  Ok: 'Ok',
  OkCancel: 'OkCancel',
  YesNoCancel: 'YesNoCancel'
})

const defaultLabels = {
  yes: 'Yes',
  no: 'No',
  ok: 'OK',
  cancel: 'Cancel'
}

export function ConfirmationModal({
  open,
  type = ConfirmationModalType.YesNo,
  title,
  message,
  labels = defaultLabels,
  onClose,
  onConfirm,
  onReject,
  onCancel,
  loading = false
}) {
  const buttonLabels = { ...defaultLabels, ...labels }

  const close = () => {
    if (!loading && onClose) onClose()
  }

  const handleConfirm = () => {
    if (!loading && onConfirm) onConfirm()
  }

  const handleReject = () => {
    if (!loading && onReject) onReject()
  }

  const handleCancel = () => {
    if (!loading && onCancel) onCancel()
  }

  const renderActions = () => {
    switch (type) {
      case ConfirmationModalType.Ok:
        return (
          <Button onClick={handleConfirm} variant="contained" disabled={loading}>
            {buttonLabels.ok}
          </Button>
        )
      case ConfirmationModalType.OkCancel:
        return (
          <>
            <Button onClick={handleCancel} disabled={loading}>
              {buttonLabels.cancel}
            </Button>
            <Button onClick={handleConfirm} variant="contained" disabled={loading}>
              {buttonLabels.ok}
            </Button>
          </>
        )
      case ConfirmationModalType.YesNoCancel:
        return (
          <>
            <Button onClick={handleCancel} disabled={loading}>
              {buttonLabels.cancel}
            </Button>
            <Button onClick={handleReject} disabled={loading}>
              {buttonLabels.no}
            </Button>
            <Button onClick={handleConfirm} variant="contained" disabled={loading}>
              {buttonLabels.yes}
            </Button>
          </>
        )
      case ConfirmationModalType.YesNo:
      default:
        return (
          <>
            <Button onClick={handleReject} disabled={loading}>
              {buttonLabels.no}
            </Button>
            <Button
              onClick={handleConfirm}
              variant="contained"
              color="error"
              disabled={loading}
            >
              {buttonLabels.yes}
            </Button>
          </>
        )
    }
  }

  const isReactNode = React.isValidElement(message)

  return (
    <Dialog open={open} onClose={close} maxWidth="xs" fullWidth>
      {title ? <DialogTitle>{title}</DialogTitle> : null}
      <DialogContent>
        {isReactNode ? (
          message
        ) : (
          <Box
            component="div"
            sx={{ mt: 1 }}
            dangerouslySetInnerHTML={{ __html: message || '' }}
          />
        )}
      </DialogContent>
      <DialogActions>{renderActions()}</DialogActions>
    </Dialog>
  )
}

export function GroupInputModal({
  open,
  title,
  instructions,
  value,
  onChange,
  onConfirm,
  onCancel,
  okLabel = 'OK',
  cancelLabel = 'Cancel',
  inputLabel,
  inputPlaceholder,
  errorText,
  maxLength,
  loading = false
}) {
  const handleClose = () => {
    if (!loading && onCancel) onCancel()
  }

  const handleConfirm = () => {
    if (!loading && onConfirm) onConfirm()
  }

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter' && !errorText && value?.trim()) {
      event.preventDefault()
      handleConfirm()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      {title ? <DialogTitle>{title}</DialogTitle> : null}
      <DialogContent>
        {instructions ? (
          <Box
            component="div"
            sx={{ mt: 1, mb: 2 }}
            dangerouslySetInnerHTML={{ __html: instructions }}
          />
        ) : null}

        <TextField
          autoFocus
          fullWidth
          value={value}
          label={inputLabel}
          placeholder={inputPlaceholder}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleInputKeyDown}
          error={Boolean(errorText)}
          helperText={errorText || ' '}
          inputProps={maxLength ? { maxLength } : undefined}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading || Boolean(errorText) || !value?.trim()}
        >
          {okLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationModal
