import { combineReducers } from '@reduxjs/toolkit'

import authReducer from './auth/authSlice'
import { resetState } from './resetSlice'

const appReducer = combineReducers({
  auth: authReducer
})

const rootReducer = (state: any, action: any) => {
  if (action.type === resetState.type) {
    return appReducer(undefined, action) // Reset state ke initialState
  }

  return appReducer(state, action)
}

export default rootReducer
