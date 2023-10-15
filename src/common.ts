export type GameId = 'custom' | 'minecraft' | 'minecraft_be' | 'factorio'
export type Protocol = 'TCP' | 'UDP'
export type EndpointClaim = {
  key?: string,
  protocol: Protocol,
  port: number
}

export type EndpointClaimRs = {
  protocol: Protocol,
  local_port: number,
  remote_port: number,
}

export function toLocalPort(game: GameId): number {
  switch(game) {
    case 'custom':
      return 3010
    case 'minecraft':
      return 25565
    case 'minecraft_be':
      return 19132
    case 'factorio':
      return 34197
  }
}
