import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { dirname } from "@tauri-apps/api/path"
import { EndpointClaim, GameId } from "../../../common"

const game: GameId = 'minecraft'

export interface MinecraftState {
  filepath: string | null,
  workdir: string | null,
  command: string,
  acceptEula: boolean,
  endpoints: EndpointClaim[],
}

export const initialState: MinecraftState = {
  filepath: null,
  workdir: null,
  acceptEula: false,
  command: 'java -Xmx1024M -Xms1024M -jar ./server.jar nogui',
  endpoints: [
    {
      protocol: 'TCP',
      port: 25565,
    }
  ]
}

export const minecraftSlice = createSlice({
  name: `local/config/${game}`,
  initialState,
  reducers: {
    setAcceptEula: (state, action: PayloadAction<boolean>) => {
      state.acceptEula = action.payload
    },
    updateCommand: (state, action: PayloadAction<string>) => {
      state.command = action.payload
    },
    updateLocalPort: (state, action: PayloadAction<number>) => {
      state.endpoints[0].port = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateFilepath.fulfilled, (state, action) => {
        const dir = action.payload
        const filepath = action.meta.arg

        state.filepath = filepath
        state.workdir = dir
        state.command = `java -Xmx1024M -Xms1024M -jar ${filepath} nogui`
      })
      .addCase(updateFilepath.rejected, () => {
        console.error(`${minecraftSlice.name}/updateFilepath rejected`)
      })
  }
})


export const updateFilepath = createAsyncThunk<string, string>(`${minecraftSlice.name}/updateFilepath`, async (filepath) => {
  return await dirname(filepath)
})


export const { setAcceptEula, updateCommand, updateLocalPort } = minecraftSlice.actions
