import { createSlice, PayloadAction, nanoid, createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from '../app/store'
import { emit } from '@tauri-apps/api/event'
import { dirname } from '@tauri-apps/api/path'
import { Child, Command } from '@tauri-apps/api/shell';

import { LaunchLocalResultError } from '../data'
import { CheckError, CheckId, checkRegistry, CheckResult, StatusCodeError, getCheckList } from '../checks'
import { GameId, toLocalPort } from '../common'
import { type } from '@tauri-apps/api/os';

export type LocalStateMessage = {
  key: string,
  message: string,
}

export interface Check {
  id: CheckId,
  status: 'idle' | 'running' | 'succeeded' | 'failed',
  message: string,
}
export const checkJavaVersion: Check = {
  id: 'check-java-version',
  status: 'idle',
  message: "",
}

// Define a type for the slice state
interface LocalState {
  status: 'idle' | 'running' | 'succeeded' | 'failed',
  error: null | string,
  messages: Array<LocalStateMessage>,
  command: string | null,
  workdir: string | null,
  filepath: string | null,
  port: number,
  game: GameId,
  checks: Array<Check>,
  child: Child | null,
}
// Define the initial state using that type
const initialState: LocalState = {
  status: 'idle',
  error: null,
  messages: [],
  command: null,
  workdir: null,
  filepath: null,
  port: toLocalPort('minecraft'),
  game: 'minecraft',
  checks: getCheckList('minecraft').map((id: CheckId) => {
    return {
      id,
      status: 'idle',
      message: '',
    }
  }),
  child: null
}

type MessagesEntry = {
  key: string,
  channel: 'stdout' | 'stderr',
  message: string,
}
export const localSlice = createSlice({
  name: 'local',
  initialState,
  reducers: {
    receiveMessage: {
      reducer: (state, action: PayloadAction<MessagesEntry>) => {
        state.messages.push(action.payload)
      },
      prepare: (channel: 'stdout' | 'stderr', message: string) => {
        return { payload: {
          key: nanoid(),
          channel,
          message
        }}
      }
    },
    setChild: (state, action: PayloadAction<Child | null>) => {
      state.child = action.payload
    },
    updateCommand: (state, action: PayloadAction<string>) => {
      state.command = action.payload
    },
    updateLocalPort: (state, action: PayloadAction<number>) => {
      state.port = action.payload
    },
    updateGame: (state, action: PayloadAction<GameId>) => {
      const game = action.payload;
      state.game = game;
      state.checks = getCheckList(game).map((id: CheckId) => {
        return {
          id,
          status: 'idle',
          message: "",
        }
      })

      state.filepath = null
      state.workdir = null
      state.port = toLocalPort(game);
      switch (game) {
        case 'custom':
          state.command = 'nc -kl 3010'
          break;
        case 'minecraft':
          state.command = null
          break;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runCheck.pending, (state, { meta }) => {
        const checkId = meta.arg;
        const check = state.checks.find(check => check.id === checkId);
        if (check) {
          check.message = ''
          check.status = 'running'
        }
        console.log(`start check ${checkId}, ${JSON.stringify(state)}`)
      })
      .addCase(runCheck.fulfilled, (state, { payload, meta }) => {
        const checkId = meta.arg;
        const check = state.checks.find(check => check.id === checkId);
        if (check) {
          check.message = payload;
          check.status = 'succeeded'
        }
        console.log(`fulfilled check ${checkId}, ${JSON.stringify(state)}`)
      })
      .addCase(runCheck.rejected, (state, action) => {
        const checkId = action.meta.arg;
        if (action.payload) {
          const check = state.checks.find(check => check.id === checkId);
          if (check) {
            check.message = action.payload;
            check.status = 'failed'
          }
        }
        console.error(`rejected check ${checkId}, ${JSON.stringify(state)}`)
      })
      .addCase(launchLocal.pending, (state, { meta }) => {
        state.status = 'running'
        state.error = null

        console.log(`start local ${JSON.stringify(state)}`)
      })
      .addCase(launchLocal.fulfilled, (state, { payload, meta }) => {
        state.status = 'succeeded'
        state.error = null
        state.child = null
        console.log(`fulfilled local ${JSON.stringify(state)}`)
      })
      .addCase(launchLocal.rejected, (state, action) => {
        state.status = 'failed'
        state.child = null

        const err = action.payload

        if (err) {
          if (err.kind === "StatusCodeError") {
            state.error = `exited with non-zero code`
          } else if (err.kind === "SpawnFailed") {
            state.error = `Failed to spawn executables ${err.payload}`
          } else if (err.kind === "CommandNotSet") {
            state.error = `command is not set`
          } else {
            state.error = "Internal client error: other error"
          }
        } else {
          state.error = `Unkwown error: ${action.error.message}`
        }

        console.error(`rejected local ${JSON.stringify(state)}`)
      })
      .addCase(killChild.fulfilled, (state) => {
        state.status = 'succeeded'
        state.child = null
      })
      .addCase(killChild.rejected, (state) => {
        state.status = 'failed'
        state.child = null
        console.error('failed to kill child')
      })
      .addCase(runChecksAndLaunchLocal.pending, (state, action) => {
        console.log(`start runCHecksAndLaunchLocal`)
      })
      .addCase(runChecksAndLaunchLocal.fulfilled, (state, action) => {
        console.log(`fullfilled runCHecksAndLaunchLocal`)
      })
      .addCase(runChecksAndLaunchLocal.rejected, (state, action) => {
        console.error(`rejected runCHecksAndLaunchLocal`)
      })
      .addCase(updateFilepath.fulfilled, (state, action) => {
        const dir = action.payload
        const filepath = action.meta.arg
        state.filepath = filepath
        state.workdir = dir
        state.command = `java -Xmx1024M -Xms1024M -jar ${filepath} nogui`
      })
      .addCase(updateFilepath.rejected, () => {
        console.error(`rejected updateFilepath`)
      })
  },
})

type LaunchLocalError =
  | {
    kind: "StatusCodeError";
    code: number,
    [k: string]: unknown;
  }
  | {
    kind: "SpawnFailed";
    payload: string;
    [k: string]: unknown;
  }
  | {
    kind: "CommandNotSet";
    [k: string]: unknown;
  }


const getCommand = async (command_inner: string, workdir: string | null) => {
  const osType = await type();

  const args = command_inner.trim().split(/\s+/)
  if (args.length === 0) {
    throw new Error('command is empty')
  }

  const spawnOptions = workdir !== null ?
    { cwd: workdir } : undefined

  switch(args[0]) {
    case 'java':
      return new Command('run-java', args.splice(1), spawnOptions)
    case 'docker':
      return new Command('run-docker', args.splice(1), spawnOptions)
    default:
      if (osType === 'Windows_NT') {
        return new Command('run-cmd', ['/c', command_inner], spawnOptions)
      } else {
        return new Command('run-sh', ['-c', command_inner], spawnOptions)
      }
  }
}

export const launchLocal = createAsyncThunk<void, undefined, { state: RootState, rejectValue: LaunchLocalError }>('launchLocal', async (_, { getState, rejectWithValue, dispatch }) => {
  const command_inner = getState().local.command;
  const workdir = getState().local.workdir;
  const game = getState().local.game;

  if (command_inner == null) {
    return rejectWithValue({
      'kind': 'CommandNotSet'
    })
  }
  const command = await getCommand(command_inner, workdir);

  const p = new Promise((res, rej) => {
    command.on('close', data => {
      console.log(`command finished with code ${data.code} and signal ${data.signal}`);

      if (data.code === 0 || data.signal != null) {
        // also success when child is killed by user (when data.signal != null)
        res(null);
      } else {
        rej({
          kind: "StatusCodeError",
          code: data.code
        })
      }
    });
    command.on('error', error => {
      console.error(`command error: "${error}"`)
      rej({
        kind: "SpawnFailed",
        payload: `command error: "${error}"`,
      });
    });
  })

  command.stdout.on('data', line => dispatch(receiveMessage('stdout', line)));
  command.stderr.on('data', line => dispatch(receiveMessage('stderr', line)));

  const child = await command.spawn();
  dispatch(setChild(child))

  try {
    await p
  } catch (e) {
    const err = e as LaunchLocalError;
    return rejectWithValue(err)
  }
})

export const killChild = createAsyncThunk<void, undefined, { state: RootState, rejectValue: LaunchLocalResultError }>('killChild', async (_, { getState, rejectWithValue, dispatch }) => {
  const child = getState().local.child;
  await child?.kill();
})

export const runCheck = createAsyncThunk<CheckResult, CheckId, { state: RootState, rejectValue: CheckError }>('checks/runCheck', async (id, { getState, rejectWithValue }) => {
  console.log(getState().local);
  let check = getState().local.checks.find(check => check.id === id);

  if (check) {
    try {
      const testResult: CheckResult = await checkRegistry[check.id]()
      return testResult
    } catch (e) {
      if (e instanceof StatusCodeError) {
        return rejectWithValue(e.message)
      }
      return rejectWithValue(`error during check: ${JSON.stringify(e)}`)
    }
  } else {
    throw new Error(`error: check not found with id: ${id}`)
  }
})

export const runChecks = createAsyncThunk<void, undefined, { state: RootState }>('runChecks', async (_, { getState, dispatch }) => {
  let checks = getState().local.checks;

  for (let check of checks) {
    await dispatch(runCheck(check.id)).unwrap()
  }
  // do not catch error caused by runCheck
})

export const runChecksAndLaunchLocal = createAsyncThunk<void, undefined, { state: RootState }>('runChecksAndLaunchLocal', async (_, { dispatch }) => {
  await dispatch(runChecks()).unwrap()
  await dispatch(launchLocal()).unwrap()
})

export const updateFilepath = createAsyncThunk<string, string>('updateFilepath', async (filepath) => {
  return await dirname(filepath)
})

const { setChild } = localSlice.actions;
export const { receiveMessage, updateCommand, updateLocalPort, updateGame } = localSlice.actions

export default localSlice.reducer
