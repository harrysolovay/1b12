;(() => {
  var e = {}
  e.id = 726,
    e.ids = [726],
    e.modules = {
      846: (e) => {
        "use strict"
        e.exports = require("next/dist/compiled/next-server/app-page.runtime.prod.js")
      },
      2103: (e, t, r) => {
        "use strict"
        r.d(t, { F0: () => c, Gm: () => s, Mb: () => i, X8: () => p, b3: () => o })
        let s = (e) => new URL(e, "https://integration-api.meshconnect.com/api/v1").href,
          a = process.env.MESH_CLIENT_ID,
          n = process.env.MESH_CLIENT_SECRET_PROD,
          o = (e) => ({ "X-Client-Id": a, "X-Client-Secret": n, ...e ? { "Content-Type": "application/json" } : {} }),
          i = "ETH",
          p = "e3c7fdd8-b1fc-4e51-85ae-bb276e075611",
          c = "0xBc25f0f12472579a901B7f2F7F2e169065E26E7b"
      },
      3033: (e) => {
        "use strict"
        e.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js")
      },
      3295: (e) => {
        "use strict"
        e.exports = require("next/dist/server/app-render/after-task-async-storage.external.js")
      },
      4870: (e) => {
        "use strict"
        e.exports = require("next/dist/compiled/next-server/app-route.runtime.prod.js")
      },
      6487: () => {},
      8008: (e, t, r) => {
        "use strict"
        r.r(t),
          r.d(t, {
            patchFetch: () => h,
            routeModule: () => u,
            serverHooks: () => b,
            workAsyncStorage: () => d,
            workUnitAsyncStorage: () => l,
          })
        var s = {}
        r.r(s), r.d(s, { POST: () => c })
        var a = r(6559), n = r(8088), o = r(7719), i = r(2103), p = r(2190)
        async function c(e) {
          let { accessToken: t, brokerType: r } = await e.json(),
            s = await fetch((0, i.Gm)("holdings/get"), {
              method: "POST",
              headers: (0, i.b3)(!0),
              body: JSON.stringify({ authToken: t, type: r, includeMarketValue: !0 }),
            }),
            { content: { cryptocurrencyPositions: a } } = await s.json(),
            n = a?.find((e) => "ETH" === e.symbol)
          return p.NextResponse.json({ balance: n?.amount ?? 0 })
        }
        let u = new a.AppRouteRouteModule({
            definition: {
              kind: n.RouteKind.APP_ROUTE,
              page: "/api/mesh/get-coinbase-balance/route",
              pathname: "/api/mesh/get-coinbase-balance",
              filename: "route",
              bundlePath: "app/api/mesh/get-coinbase-balance/route",
            },
            resolvedPagePath: "/Users/harrysolovay/Desktop/1b1b1b1b/app/api/mesh/get-coinbase-balance/route.ts",
            nextConfigOutput: "",
            userland: s,
          }),
          { workAsyncStorage: d, workUnitAsyncStorage: l, serverHooks: b } = u
        function h() {
          return (0, o.patchFetch)({ workAsyncStorage: d, workUnitAsyncStorage: l })
        }
      },
      8335: () => {},
      9294: (e) => {
        "use strict"
        e.exports = require("next/dist/server/app-render/work-async-storage.external.js")
      },
    }
  var t = require("../../../../webpack-runtime.js")
  t.C(e)
  var r = (e) => t(t.s = e), s = t.X(0, [447, 580], () => r(8008))
  module.exports = s
})()
