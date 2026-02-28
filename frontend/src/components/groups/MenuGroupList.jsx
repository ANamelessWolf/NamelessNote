import { Add, ExpandLess, ExpandMore } from '@mui/icons-material'
import {
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  List,
  Stack,
  Tooltip,
  Typography
} from '@mui/material'
import { useState } from 'react'
import GroupListItem from './GroupListItem'
import GroupsSearchBar from './GroupsSearchBar'
import { MAX_GROUP_NAMES_IN_LIST } from '../../assets/strings'

export default function MenuGroupList({
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  onDeleteGroup,
  deletingById,
  searchTerm,
  onSearchChange
}) {
  const shouldEnableListScrollByCount = groups.length > MAX_GROUP_NAMES_IN_LIST
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Menu Group
        </Typography>
        <Tooltip title={isCollapsed ? 'Expandir' : 'Colapsar'}>
          <IconButton size="small" onClick={() => setIsCollapsed((prev) => !prev)}>
            {isCollapsed ? <ExpandMore fontSize="small" /> : <ExpandLess fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Stack>

      <Collapse in={!isCollapsed}>
        <GroupsSearchBar value={searchTerm} onChange={onSearchChange} />
        <List
          dense
          disablePadding
          sx={{
            ...(shouldEnableListScrollByCount
              ? {
                  maxHeight: '20vh',
                  overflowY: 'auto'
                }
              : {}),
            '@media (max-width:600px) and (orientation: portrait)': {
              maxHeight: '33vh',
              overflowY: 'auto'
            }
          }}
        >
          {groups.map((group) => (
            <GroupListItem
              key={group._id}
              group={group}
              selected={selectedGroupId === group._id}
              onSelect={onSelectGroup}
              onDelete={onDeleteGroup}
              deleting={Boolean(deletingById[group._id])}
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
      </Collapse>
    </Box>
  )
}
