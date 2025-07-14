import { Api } from "@1b1/domain"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as HttpApiClient from "@effect/platform/HttpApiClient"
import * as HttpClient from "@effect/platform/HttpClient"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

class Client extends Effect.Service<Client>()("Client", {
  accessors: true,
  dependencies: [
    FetchHttpClient.layer.pipe(
      Layer.provide(
        Layer.succeed(FetchHttpClient.RequestInit, {
          credentials: "include",
        }),
      ),
    ),
  ],
  effect: HttpApiClient.make(Api, {
    baseUrl: import.meta.env.VITE_SERVER_URL,
    transformClient: HttpClient.retryTransient({
      times: 3,
    }),
  }),
}) {
}

export const client = Client.pipe(
  Effect.provide(Client.Default),
  Effect.runSync,
)
