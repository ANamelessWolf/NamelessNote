import { configureStore } from '@reduxjs/toolkit'
import groupsReducer from './slices/groupsSlice'

export const store = configureStore({
  reducer: {
    groups: groupsReducer
  }
})
