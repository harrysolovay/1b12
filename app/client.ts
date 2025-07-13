import { Api } from "@1b1/domain"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as HttpApiClient from "@effect/platform/HttpApiClient"
import * as HttpClient from "@effect/platform/HttpClient"
import * as Effect from "effect/Effect"

export class Client extends Effect.Service<Client>()("Client", {
  accessors: true,
  dependencies: [FetchHttpClient.layer],
  effect: HttpApiClient.make(Api, {
    baseUrl: "http://localhost:3000",
    transformClient: (client) =>
      client.pipe(
        HttpClient.retryTransient({ times: 3 }),
      ),
  }),
}) {
  static make() {
    return Client.pipe(
      Effect.provide(Client.Default),
      Effect.runSync,
    )
  }
}
