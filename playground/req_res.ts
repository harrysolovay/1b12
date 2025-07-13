// import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
// import * as MeshClient from "@1b1/mesh/Client"
// import * as Config from "effect/Config"
// import * as Effect from "effect/Effect"

// const MeshClientLive = MeshClient.layerConfig({
//   baseUrl: Config.string("MESH_BASE_URL"),
//   clientId: Config.redacted("MESH_CLIENT_ID"),
//   apiKey: Config.redacted("MESH_API_KEY"),
// })

// const program = Effect.gen(function*() {
//   const mesh = yield* MeshClient.MeshClient
//   const result = yield* mesh["GET/api/v1/transfers/managed/tokens"]()
//   const g = yield* mesh["POST/api/v1/linktoken"]({
//     userId: "",
//   })
//   if (g.status === "ok" && g.content) {
//     g.content.linkToken
//   }
//   // const result = yield* mesh["GET/api/v1/status"]()
//   console.log(result)
// })

// await program.pipe(
//   Effect.provide(MeshClientLive),
//   Effect.provide(FetchHttpClient.layer),
//   Effect.runPromise,
// )
