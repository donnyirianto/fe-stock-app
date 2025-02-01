import { combineReducers } from '@reduxjs/toolkit'

import menuReducer from './base/menuSlice'
import { resetState } from './resetSlice'

const appReducer = combineReducers({
  menu: menuReducer
})

const rootReducer = (state: any, action: any) => {
  if (action.type === resetState.type) {
    return appReducer(undefined, action) // Reset state ke initialState
  }

  return appReducer(state, action)
}

export default rootReducer
