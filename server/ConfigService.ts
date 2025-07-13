import * as Config from "effect/Config"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"

export class ConfigService extends Effect.Service<ConfigService>()("ConfigService", {
  effect: Config.all({
    clientId: Config.string("MESH_CLIENT_ID"),
    secret: Config.redacted("MESH_SECRET"),
    destinationAddress: Config.string("DESTINATION_ETHEREUM_ADDRESS"),
  }),
  accessors: true,
}) {}
