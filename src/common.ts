export type GameId = 'custom' | 'minecraft' | 'minecraft_be' | 'factorio'
export type Protocol = 'TCP' | 'UDP'

export function formatProtocol(protocol: Protocol): string {
  switch (protocol) {
    case 'TCP':
      return 'tcp'
    case 'UDP':
      return 'udp'
  }
}
export type EndpointClaim = {
  key: string,
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

export interface Endpoint {
  id: string,
  protocol: Protocol,
  local_port: number,
  remote_port: number
}

export function isEndpoint(obj: any): obj is Endpoint {
  return (
    typeof obj.id === 'string' &&
    (obj.protocol === 'TCP' || obj.protocol === 'UDP') &&
    typeof obj.local_port === 'number' &&
    typeof obj.remote_port === 'number'
  );
}

export interface ClientInfo {
  client_id: string,
  host: string,
  endpoints: Endpoint[],
}

export function isClientInfo(obj: any): obj is ClientInfo {
  return (
    typeof obj.client_id === 'string' &&
    typeof obj.host === 'string' &&
    Array.isArray(obj.endpoints) &&
    obj.endpoints.every((endpoint: any) => isEndpoint(endpoint))
  );
}
