import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../app/store'
import { invoke } from '@tauri-apps/api/tauri'
import { isLaunchResultError, LaunchResultError } from '../data'
import { emit } from '@tauri-apps/api/event'
import { ClientInfo, EndpointClaimRs } from '../common'


// Define a type for the slice state
interface TunnelState {
  tunnelStatus: 'idle' | 'running' | 'succeeded' | 'failed',
  clientInfo: null | ClientInfo,
  error: null | string,
  tokenServer: string,
}

// Define the initial state using that type
const initialState: TunnelState = {
  tunnelStatus: 'idle',
  clientInfo: null,
  error: null,
  tokenServer: "https://auth.ownserver.kumassy.com/v2/request_token",
}

export const tunnelSlice = createSlice({
  name: 'tunnel',
  initialState,
  reducers: {
    updateClientInfo: (state, action: PayloadAction<ClientInfo>) => {
      state.clientInfo = action.payload
    },
    updateTokenServer: (state, action: PayloadAction<string>) => {
      state.tokenServer = action.payload
    },
    interruptTunnel: {
      reducer: state => {
        state.tunnelStatus = 'idle'
        state.clientInfo = null
        state.error = null
        console.log(`interrupt tunnel: ${JSON.stringify(state)}`)
      },
      prepare: () => {
        emit('interrupt_launch_tunnel')
        console.log(`emit: interrupt_launch_tunnel`)
        return { payload: {} }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(launchTunnel.pending, (state) => {
        state.tunnelStatus = 'running'
        state.clientInfo = null
        state.error = null
        console.log(`start tunnel: ${JSON.stringify(state)}`)
      })
      .addCase(launchTunnel.fulfilled, (state) => {
        state.tunnelStatus = 'succeeded'
        state.clientInfo = null
        state.error = null
        console.log(`fullfiled tunnel: ${JSON.stringify(state)}`)
      })
      .addCase(launchTunnel.rejected, (state, action) => {
        state.tunnelStatus = 'failed'

        if (action.payload) {
          state.error = `${JSON.stringify(action.payload)}`
        } else {
          state.error = `${JSON.stringify(action.error)}`
        }
        console.log(`rejected tunnel: ${JSON.stringify(state)}`)
      })
  }
})

export const launchTunnel = createAsyncThunk<void, undefined, { state: RootState, rejectValue: LaunchResultError }>('launchTunnel', async (_, { getState, rejectWithValue }) => {
  const stateBefore = getState()
  const game = stateBefore.local.game
  const endpoint_claims = stateBefore.local.config[game].endpoints

  const endpoint_claims_rs: EndpointClaimRs[] = endpoint_claims.map(e => {
    return {
      protocol: e.protocol,
      local_port: e.port,
      remote_port: 0,
    }
  })
  try {
    // this handle Ok value of launch_tunnel, ()
    // when launch_tunnel returns (), invoke is evaluated as null
    await invoke('launch_tunnel', { tokenServer: stateBefore.tunnel.tokenServer, endpointClaims: endpoint_claims_rs })
    return;
  } catch (e) {
    if (isLaunchResultError(e)) {
      return rejectWithValue(e)
    } else {
      throw new Error('unknown error')
    }
  }
})

export const { updateClientInfo, updateTokenServer, interruptTunnel } = tunnelSlice.actions

export const selectClientInfo = (state: RootState) => state.tunnel.clientInfo

export default tunnelSlice.reducer
