import { Add } from '@mui/icons-material'
import { Box, Button, Divider, List, Typography } from '@mui/material'
import GroupListItem from './GroupListItem'

export default function MenuGroupList({
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup
}) {
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
        Menu Group
      </Typography>
      <List dense disablePadding>
        {groups.map((group) => (
          <GroupListItem
            key={group.id}
            group={group}
            selected={selectedGroupId === group.id}
            onSelect={onSelectGroup}
          />
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Button
        variant="contained"
        fullWidth
        startIcon={<Add />}
        onClick={onCreateGroup}
      >
        Nuevo Grupo
      </Button>
    </Box>
  )
}
