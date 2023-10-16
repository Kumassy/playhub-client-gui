import { configureStore } from '@reduxjs/toolkit'
import tunnelReducer from '../features/tunnelSlice'
import localReducer from '../features/localSlice'
import tauriReducer from '../features/tauriSlice'

const store = configureStore({
    reducer: {
        tunnel: tunnelReducer,
        local: localReducer,
        tauri: tauriReducer,
    }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
