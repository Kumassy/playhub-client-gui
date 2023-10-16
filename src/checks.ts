import { invoke } from '@tauri-apps/api'
import { Command } from '@tauri-apps/api/shell'
import { RootState } from './app/store'
import { GameId } from './common'
import { isCreateEulaError } from './data'

export type CheckId = string

export type CheckResult = string
export type CheckError = string

// Check Pass: returns message with CheckResult
// Check Fail: throw errors containing error message
export type CheckFunc = (state?: RootState) => Promise<CheckResult>
export class StatusCodeError extends Error {}

export interface CheckRegistry {
  [id: CheckId]: CheckFunc
}

export const CHECK_JAVA_VERSION: CheckId = 'check-java-version'
export const CHECK_SH_VERSION: CheckId = 'check-sh-version'
export const CHECK_DOCKER_VERSION: CheckId = 'check-docker-version'
export const CHECK_OR_CREATE_EULA: CheckId = 'check-or-create-eula'

export const checkRegistry: CheckRegistry = {
  [CHECK_JAVA_VERSION]: async () => {
    const output = await new Command('java', ['--version']).execute()
    if (output.code !== 0) {
      const message = `test exited with non-zero code: ${output.code}, stderr: ${output.stderr}`
      throw new StatusCodeError(message)
    }
    return output.stdout
  },
  [CHECK_SH_VERSION]: async () => {
    const output = await new Command('sh', ['--version']).execute()
    if (output.code !== 0) {
      const message = `test exited with non-zero code: ${output.code}, stderr: ${output.stderr}`
      throw new StatusCodeError(message)
    }
    return output.stdout
  },
  [CHECK_DOCKER_VERSION]: async () => {
    const output = await new Command('docker', ['--version']).execute()
    if (output.code !== 0) {
      const message = `test exited with non-zero code: ${output.code}, stderr: ${output.stderr}`
      throw new StatusCodeError(message)
    }
    return output.stdout
  },
  [CHECK_OR_CREATE_EULA]: async (state?: RootState) => {
    if (state?.local.game !== 'minecraft') {
      throw new Error('config is not for minecraft')
    }

    const workdir = state.local.config.minecraft.workdir;
    if (workdir == null) {
      throw new Error('workdir not set')
    }

    try {
      await invoke('create_eula', { basedir: workdir })
    } catch (e) {
      if (isCreateEulaError(e)) {
        throw new Error(JSON.stringify(e))
      } else {
        throw new Error('unknown error')
      }
    }

    return ""
  }
}

export type CheckEntry = {
  id: CheckId,
  label: string
}
export const getCheckList = (game: GameId): Array<CheckEntry> => {
  switch (game) {
    case 'custom':
      return []
    case 'minecraft':
      return [{ id: CHECK_JAVA_VERSION, label: "javaVersion"}, { id: CHECK_OR_CREATE_EULA, label: "createEula"}]
    case 'minecraft_be':
      return []
    case 'factorio':
      return [{ id: CHECK_DOCKER_VERSION, label: "dockerVersion"}]
  }
}
