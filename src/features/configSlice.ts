import { PayloadAction, combineReducers, createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { MinecraftState, minecraftSlice, initialState as minecraftInitialState } from "./reducers/games/minecraft"
import { MinecraftBeState, initialState as minecraftBeInitialState, minecraftBeSlice } from "./reducers/games/minecraftBe"
import { FactorioState, initialState as factorioInitialState, factorioSlice } from "./reducers/games/factorio"
import { CustomState, initialState as customInitialState, customSlice } from "./reducers/games/custom"

export interface ConfigState {
  custom: CustomState,
  minecraft: MinecraftState
  minecraft_be: MinecraftBeState,
  factorio: FactorioState,
}
// Define the initial state using that type
const initialState: ConfigState = {
  custom: customInitialState,
  minecraft: minecraftInitialState,
  minecraft_be: minecraftBeInitialState,
  factorio: factorioInitialState
}


const gamesReducer = combineReducers({
  custom: customSlice.reducer,
  minecraft: minecraftSlice.reducer,
  minecraft_be: minecraftBeSlice.reducer,
  factorio: factorioSlice.reducer,
})
export const configSlice = createSlice({
  name: 'local/config',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addDefaultCase((state, action) => {
      state = gamesReducer(state, action)
    })
  }
})
