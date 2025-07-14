import * as HttpClient from "@effect/platform/HttpClient"
import * as HttpClientRequest from "@effect/platform/HttpClientRequest"
import * as Config from "effect/Config"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import { flow } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"
import { type Client, make as makeGenerated } from "./Generated.ts"

export class MeshClient extends Context.Tag("MeshClient")<MeshClient, Client>() {}

export interface MeshClientConfig {
  clientId: string
  secret: Redacted.Redacted
}

export const make = Effect.fnUntraced(function*({ clientId, secret }: MeshClientConfig) {
  return (yield* HttpClient.HttpClient).pipe(
    HttpClient.mapRequest(flow(
      HttpClientRequest.prependUrl("https://integration-api.meshconnect.com"),
      HttpClientRequest.setHeaders({
        "X-Client-Id": clientId,
        "X-Client-Secret": Redacted.value(secret),
      }),
    )),
    makeGenerated,
  )
})

export const layerConfig = (config: Config.Config.Wrap<MeshClientConfig>) =>
  Layer.effect(
    MeshClient,
    Config.unwrap(config).pipe(
      Effect.flatMap(make),
    ),
  )
