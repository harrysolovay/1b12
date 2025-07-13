import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import * as Schema from "effect/Schema"

export class GetNetworksAndIntegrationsSuccess
  extends Schema.Class<GetNetworksAndIntegrationsSuccess>("GetNetworksAndIntegrationsSuccess")({
    networks: Schema.Array(Schema.Unknown),
    integrations: Schema.Array(Schema.Unknown),
  })
{}

export const getNetworksAndIntegrations = HttpApiEndpoint
  .get("getNetworksAndIntegrations")`/get_networks_and_integrations`
  .addSuccess(GetNetworksAndIntegrationsSuccess)
