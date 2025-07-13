;(() => {
  var e = {}
  e.id = 468,
    e.ids = [468],
    e.modules = {
      846: (e) => {
        "use strict"
        e.exports = require("next/dist/compiled/next-server/app-page.runtime.prod.js")
      },
      971: (e, t, r) => {
        "use strict"
        r.r(t),
          r.d(t, {
            patchFetch: () => k,
            routeModule: () => u,
            serverHooks: () => d,
            workAsyncStorage: () => c,
            workUnitAsyncStorage: () => l,
          })
        var s = {}
        r.r(s), r.d(s, { POST: () => p })
        var n = r(6559), o = r(8088), i = r(7719), a = r(2190)
        async function p(e) {
          let { userId: t, integrationId: r, enableTransfers: s = !0, transferOptions: n } = await e.json()
          console.log("xfer ops", n)
          let o = { userId: t, enableTransfers: s, restrictMultipleAccounts: !0 }
          r && (o.integrationId = r), n && (o.transferOptions = n)
          let i = await fetch("https://integration-api.meshconnect.com/api/v1/linktoken", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Client-Id": process.env.MESH_CLIENT_ID,
                "X-Client-Secret": process.env.MESH_CLIENT_SECRET_PROD,
              },
              body: JSON.stringify(o),
            }),
            { content: p } = await i.json()
          return a.NextResponse.json({ linkToken: p.linkToken })
        }
        let u = new n.AppRouteRouteModule({
            definition: {
              kind: o.RouteKind.APP_ROUTE,
              page: "/api/mesh/link-token/route",
              pathname: "/api/mesh/link-token",
              filename: "route",
              bundlePath: "app/api/mesh/link-token/route",
            },
            resolvedPagePath: "/Users/harrysolovay/Desktop/1b1b1b1b/app/api/mesh/link-token/route.ts",
            nextConfigOutput: "",
            userland: s,
          }),
          { workAsyncStorage: c, workUnitAsyncStorage: l, serverHooks: d } = u
        function k() {
          return (0, i.patchFetch)({ workAsyncStorage: c, workUnitAsyncStorage: l })
        }
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
      8335: () => {},
      9294: (e) => {
        "use strict"
        e.exports = require("next/dist/server/app-render/work-async-storage.external.js")
      },
    }
  var t = require("../../../../webpack-runtime.js")
  t.C(e)
  var r = (e) => t(t.s = e), s = t.X(0, [447, 580], () => r(971))
  module.exports = s
})()
