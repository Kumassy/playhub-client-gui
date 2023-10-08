import { PayloadAction, createSlice } from "@reduxjs/toolkit"

export interface ConfigState {
  custom: {
    command: string,
  },
  minecraft: {
    filepath: string | null,
    workdir: string | null,
    acceptEula: boolean,
  },
  minecraft_be: {
    filepath: string | null,
    workdir: string | null,
  },
  factorio: {
    savepath: string | null,
  }
}
// Define the initial state using that type
const initialState: ConfigState = {
  custom: {
    command: 'nc -kl 3010',
    // endpoints: [
    //   {
    //     protocol: 'tcp',
    //     port: 3010,
    //   }
    // ]
  },
  minecraft: {
    filepath: null,
    workdir: null,
    acceptEula: false,
    // endpoints: [
    //   {
    //     protocol: 'tcp',
    //     port: 25565,
    //   }
    // ]
  },
  minecraft_be: {
    filepath: null,
    workdir: null,
    // endpoints: [
    //   {
    //     protocol: 'tcp',
    //     port: 19132,
    //   }
    // ]
  },
  factorio: {
    savepath: null,
    // endpoints: [
    //   {
    //     protocol: 'udp',
    //     port: 34197,
    //   }
    // ]
  }
}


export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setMinecraftFilePathChild: (state, action: PayloadAction<string>) => {
      state.minecraft.filepath = action.payload
      console.log("configReducers");
      console.log(state, action);
    },
  }
})

export const { setMinecraftFilePathChild } = configSlice.actions
