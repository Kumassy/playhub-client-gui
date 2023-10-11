import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { GameId } from "../../../common"

const game: GameId = 'custom'

export interface CustomState {
  command: string,
}

export const initialState: CustomState = {
  command: 'nc -kl 3010',
}

export const customSlice = createSlice({
  name: `local/config/${game}`,
  initialState,
  reducers: {
    updateCommand: (state, action: PayloadAction<string>) => {
      state.command = action.payload
    }
  }
})

export const { updateCommand } = customSlice.actions
