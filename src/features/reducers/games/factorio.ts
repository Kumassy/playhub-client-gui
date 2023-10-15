import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { dirname } from "@tauri-apps/api/path"
import { EndpointClaim, GameId } from "../../../common"

const game: GameId = 'factorio'

export interface FactorioState {
  savepath: string,
  command: string,
  endpoints: EndpointClaim[],
}

export const initialState: FactorioState = {
  savepath: './',
  command: 'docker run --rm -i -p 34197:34197/udp -v ./:/factorio --name ownserver-local-factorio factoriotools/factorio',
  endpoints: [
    {
      protocol: 'UDP',
      port: 34197,
    }
  ]
}

export const factorioSlice = createSlice({
  name: `local/config/${game}`,
  initialState,
  reducers: {
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

        state.savepath = filepath
        state.command = `docker run --rm -i -p 34197:34197/udp -v ${dir}:/factorio --name ownserver-local-factorio factoriotools/factorio`
      })
      .addCase(updateFilepath.rejected, () => {
        console.error(`${factorioSlice.name}/updateFilepath rejected`)
      })
  }
})

export const updateFilepath = createAsyncThunk<string, string>(`${factorioSlice.name}/updateFilepath`, async (filepath) => {
  return await dirname(filepath)
})


export const { updateCommand, updateLocalPort } = factorioSlice.actions
