import { DeleteOutline } from '@mui/icons-material'
import { IconButton, ListItemButton, ListItemText, Stack } from '@mui/material'

export default function GroupListItem({
  group,
  selected,
  onSelect,
  onDelete,
  deleting
}) {
  return (
    <Stack direction="row" alignItems="center">
      <ListItemButton selected={selected} onClick={() => onSelect(group._id)}>
        <ListItemText primary={group.groupName} />
      </ListItemButton>
      <IconButton
        color="error"
        size="small"
        onClick={() => onDelete(group._id)}
        disabled={deleting}
      >
        <DeleteOutline fontSize="small" />
      </IconButton>
    </Stack>
  )
}
