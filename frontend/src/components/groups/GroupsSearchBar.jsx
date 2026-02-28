import SearchIcon from '@mui/icons-material/Search'
import { InputAdornment, TextField } from '@mui/material'

export default function GroupsSearchBar({ value, onChange }) {
  return (
    <TextField
      size="small"
      fullWidth
      placeholder="Buscar grupo..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{ mb: 1.5 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        )
      }}
    />
  )
}
