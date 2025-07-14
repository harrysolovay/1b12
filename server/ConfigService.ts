import * as Config from "effect/Config"
import * as Effect from "effect/Effect"

export class ConfigService extends Effect.Service<ConfigService>()("ConfigService", {
  effect: Config.all({
    clientId: Config.string("VITE_MESH_CLIENT_ID"),
    secret: Config.redacted("MESH_SECRET"),
    destinationAddress: Config.string("DESTINATION_ETHEREUM_ADDRESS"),
    clerkPublishableKey: Config.string("VITE_CLERK_PUBLISHABLE_KEY"),
    clerkSecret: Config.redacted("CLERK_SECRET"),
  }),
  accessors: true,
}) {}
