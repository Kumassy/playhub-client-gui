import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { dirname } from "@tauri-apps/api/path"
import { GameId } from "../common"

export interface ConfigState {
  custom: {
    command: string,
  },
  minecraft: {
    filepath: string | null,
    workdir: string | null,
    command: string,
    acceptEula: boolean,
  },
  minecraft_be: {
    filepath: string | null,
    workdir: string | null,
    command: string,
  },
  factorio: {
    savepath: string,
    command: string,
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
    command: 'java -Xmx1024M -Xms1024M -jar ./server.jar nogui',
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
    command: './bedrock_server',
    // endpoints: [
    //   {
    //     protocol: 'tcp',
    //     port: 19132,
    //   }
    // ]
  },
  factorio: {
    savepath: './',
    command: `docker run --rm -i -p 34197:34197/udp -v ./:/factorio --name ownserver-local-factorio factoriotools/factorio`
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
    minecraftSetAcceptEula: (state, action: PayloadAction<boolean>) => {
      state.minecraft.acceptEula = action.payload
    },
    minecraftUpdateCommand: (state, action: PayloadAction<string>) => {
      state.minecraft.command = action.payload
    },
    minecraftBeUpdateCommand: (state, action: PayloadAction<string>) => {
      state.minecraft_be.command = action.payload
    },
    customUpdateCommand: (state, action: PayloadAction<string>) => {
      state.custom.command = action.payload
    },
    factorioUpdateCommand: (state, action: PayloadAction<string>) => {
      state.factorio.command = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateFilepath.fulfilled, (state, action) => {
        const dir = action.payload
        const { filepath, game } = action.meta.arg

        switch(game) {
          case 'minecraft':
            state.minecraft.filepath = filepath
            state.minecraft.workdir = dir
            state.minecraft.command = `java -Xmx1024M -Xms1024M -jar ${filepath} nogui`
            break;
          case 'minecraft_be':
            state.minecraft_be.filepath = filepath
            state.minecraft_be.workdir = dir
            state.minecraft_be.command = `${filepath}`
            break

          case 'factorio':
            state.factorio.savepath = filepath
            break;
        }
      })
      .addCase(updateFilepath.rejected, () => {
        console.error(`rejected updateFilepath`)
      })
  }
})




interface updateFilepathArg {
  filepath: string,
  game: GameId,
}
export const updateFilepath = createAsyncThunk<string, updateFilepathArg>(`${configSlice.name}/updateFilepath`, async ({filepath, game}) => {
  return await dirname(filepath)
})

export const { minecraftSetAcceptEula, minecraftUpdateCommand, minecraftBeUpdateCommand, customUpdateCommand, factorioUpdateCommand } = configSlice.actions
