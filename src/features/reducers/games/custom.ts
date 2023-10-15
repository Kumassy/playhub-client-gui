import { PayloadAction, createSlice, nanoid } from "@reduxjs/toolkit"
import { EndpointClaim, GameId, Protocol } from "../../../common"

const game: GameId = 'custom'

export interface CustomState {
  command: string,
  endpoints: EndpointClaim[],
}

export const initialState: CustomState = {
  command: 'nc -kl 3010',
  endpoints: [
    {
      key: 'main',
      protocol: 'TCP',
      port: 3010,
    }
  ]
}

export const customSlice = createSlice({
  name: `local/config/${game}`,
  initialState,
  reducers: {
    updateCommand: (state, action: PayloadAction<string>) => {
      state.command = action.payload
    },
    updateLocalPort: (state, action: PayloadAction<{key: string, port: number}>) => {
      const { key, port } = action.payload
      const endpoint = state.endpoints.find(endpoint => endpoint.key === key)
      if (!endpoint) {
        return
      }
      endpoint.port = port
    },
    updateProtocol: (state, action: PayloadAction<{ key: string, protocol: Protocol }>) => {
      const { key, protocol } = action.payload
      const endpoint = state.endpoints.find(endpoint => endpoint.key === key)
      if (!endpoint) {
        return
      }
      endpoint.protocol = protocol
    },
    addEndpoint: {
      reducer: (state, action: PayloadAction<EndpointClaim>) => {
        state.endpoints.push(action.payload)
      },
      prepare: () => {
        const claim: EndpointClaim = {
          key: nanoid(),
          protocol: 'TCP',
          port: 3010
        }
        return {
          payload: claim
        }
      }
    },
    removeEndpoint: (state, action: PayloadAction<string>) => {
      const key = action.payload
      const index = state.endpoints.findIndex(endpoint => endpoint.key === key)
      if (index === -1) {
        return
      }
      state.endpoints.splice(index, 1)
    }
  },
})

export const { updateCommand, updateLocalPort, updateProtocol } = customSlice.actions
