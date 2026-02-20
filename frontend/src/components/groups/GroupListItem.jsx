import { ListItemButton, ListItemText } from '@mui/material'

export default function GroupListItem({ group, selected, onSelect }) {
  return (
    <ListItemButton selected={selected} onClick={() => onSelect(group.id)}>
      <ListItemText primary={group.name} secondary={`${group.items.length} items`} />
    </ListItemButton>
  )
}
