export type GameId = 'custom' | 'minecraft' | 'minecraft_be' | 'factorio'
export type Protocol = 'tcp' | 'udp'
export type EndpointClaim = {
  protocol: Protocol,
  port: number
}
export type EndpointClaims = Array<EndpointClaim>

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
