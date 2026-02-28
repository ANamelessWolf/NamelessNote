import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { createGroup, deleteGroup, getGroups } from '../../api/groups'

const initialState = {
  items: [],
  searchTerm: '',
  status: 'idle',
  error: null,
  creating: false,
  deletingById: {}
}

export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (search = '', { rejectWithValue }) => {
    try {
      let items = await getGroups(search)
      // sort alphabetically by groupName (A-Z)
      if (Array.isArray(items)) {
        items = items.slice().sort((a, b) =>
          a.groupName.localeCompare(b.groupName, undefined, { sensitivity: 'base' })
        )
      }
      return items
    } catch (error) {
      return rejectWithValue(error.message || 'Error loading groups')
    }
  }
)

export const createGroupThunk = createAsyncThunk(
  'groups/createGroup',
  async (groupName, { rejectWithValue }) => {
    try {
      const created = await createGroup(groupName)
      return created
    } catch (error) {
      return rejectWithValue(error.message || 'Error creating group')
    }
  }
)

export const deleteGroupThunk = createAsyncThunk(
  'groups/deleteGroup',
  async (groupId, { rejectWithValue }) => {
    try {
      await deleteGroup(groupId)
      return groupId
    } catch (error) {
      return rejectWithValue({
        groupId,
        message: error.message || 'Error deleting group'
      })
    }
  }
)

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    setSearchTerm(state, action) {
      state.searchTerm = action.payload
    },
    clearGroupsError(state) {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroups.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })

      .addCase(createGroupThunk.pending, (state) => {
        state.creating = true
        state.error = null
      })
      .addCase(createGroupThunk.fulfilled, (state, action) => {
        state.creating = false
        if (action.payload) {
          state.items.push(action.payload)
          state.items.sort((a, b) =>
            a.groupName.localeCompare(b.groupName, undefined, { sensitivity: 'base' })
          )
        }
      })
      .addCase(createGroupThunk.rejected, (state, action) => {
        state.creating = false
        state.error = action.payload || action.error.message
      })

      .addCase(deleteGroupThunk.pending, (state, action) => {
        state.deletingById[action.meta.arg] = true
        state.error = null
      })
      .addCase(deleteGroupThunk.fulfilled, (state, action) => {
        delete state.deletingById[action.payload]
        state.items = state.items.filter((item) => item._id !== action.payload)
      })
      .addCase(deleteGroupThunk.rejected, (state, action) => {
        const groupId = action.payload?.groupId || action.meta.arg
        delete state.deletingById[groupId]
        state.error = action.payload?.message || action.error.message
      })
  }
})

export const { setSearchTerm, clearGroupsError } = groupsSlice.actions
export default groupsSlice.reducer

