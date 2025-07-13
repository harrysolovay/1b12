;(() => {
  var e = {}
  e.id = 901,
    e.ids = [901],
    e.modules = {
      846: (e) => {
        "use strict"
        e.exports = require("next/dist/compiled/next-server/app-page.runtime.prod.js")
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
      6914: (e, t, r) => {
        "use strict"
        r.r(t),
          r.d(t, {
            patchFetch: () => h,
            routeModule: () => l,
            serverHooks: () => d,
            workAsyncStorage: () => u,
            workUnitAsyncStorage: () => c,
          })
        var o = {}
        r.r(o), r.d(o, { POST: () => p })
        var s = r(6559), n = r(8088), a = r(7719), i = r(2190)
        async function p(e) {
          let { accessToken: t } = await e.json(),
            r = await fetch("https://integration-api.meshconnect.com/api/v1/holdings/get", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Client-Id": process.env.MESH_CLIENT_ID,
                "X-Client-Secret": process.env.MESH_CLIENT_SECRET_PROD,
              },
              body: JSON.stringify({ authToken: t, type: "deFiWallet" }),
            })
          if (!r.ok) {
            return console.error("Failed to fetch portfolio holdings:", await r.text()),
              i.NextResponse.json({ error: "Failed to fetch holdings" }, { status: 500 })
          }
          let o = await r.json(), s = o.content.cryptocurrencyPositions?.find((e) => "ETH" === e.symbol)
          return i.NextResponse.json({ balance: s?.amount ?? 0 })
        }
        let l = new s.AppRouteRouteModule({
            definition: {
              kind: n.RouteKind.APP_ROUTE,
              page: "/api/mesh/get-wallet-portfolio/route",
              pathname: "/api/mesh/get-wallet-portfolio",
              filename: "route",
              bundlePath: "app/api/mesh/get-wallet-portfolio/route",
            },
            resolvedPagePath: "/Users/harrysolovay/Desktop/1b1b1b1b/app/api/mesh/get-wallet-portfolio/route.ts",
            nextConfigOutput: "",
            userland: o,
          }),
          { workAsyncStorage: u, workUnitAsyncStorage: c, serverHooks: d } = l
        function h() {
          return (0, a.patchFetch)({ workAsyncStorage: u, workUnitAsyncStorage: c })
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
  var r = (e) => t(t.s = e), o = t.X(0, [447, 580], () => r(6914))
  module.exports = o
})()
