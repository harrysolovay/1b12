import * as Config from "effect/Config"
import * as Effect from "effect/Effect"

export class ConfigService extends Effect.Service<ConfigService>()("ConfigService", {
  effect: Config.all({
    clientId: Config.string("VITE_MESH_CLIENT_ID"),
    secret: Config.redacted("MESH_SECRET"),
    destinationAddress: Config.string("DESTINATION_ETHEREUM_ADDRESS"),
    clerkSecret: Config.redacted("CLERK_SECRET"),
  }),
  accessors: true,
}) {}
