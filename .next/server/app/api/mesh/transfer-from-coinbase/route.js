;(() => {
  var e = {}
  e.id = 787,
    e.ids = [787],
    e.modules = {
      846: (e) => {
        "use strict"
        e.exports = require("next/dist/compiled/next-server/app-page.runtime.prod.js")
      },
      1566: (e, t, r) => {
        "use strict"
        r.r(t),
          r.d(t, {
            patchFetch: () => m,
            routeModule: () => c,
            serverHooks: () => l,
            workAsyncStorage: () => u,
            workUnitAsyncStorage: () => f,
          })
        var s = {}
        r.r(s), r.d(s, { POST: () => d })
        var n = r(6559), o = r(8088), a = r(7719), i = r(2103), p = r(2190)
        async function d(e) {
          let { accessToken: t, brokerType: r, amount: s } = await e.json(),
            n = await fetch(`${i.MESH_BASE_URL}/transfers/managed/configure`, {
              method: "POST",
              headers: { "Content-Type": "application/json", ...i.b3 },
              body: JSON.stringify({
                fromAuthToken: t,
                fromType: r,
                symbol: "ETH",
                amount: s,
                toAddresses: [{ networkId: i.X8, symbol: "ETH", address: i.F0 }],
                networkId: i.X8,
              }),
            }),
            o = await n.json()
          console.log("conf holdings", o?.content?.holdings)
          let a = await fetch(`${i.MESH_BASE_URL}/transfers/managed/preview`, {
              method: "POST",
              headers: { "Content-Type": "application/json", ...i.b3 },
              body: JSON.stringify({
                fromAuthToken: t,
                fromType: r,
                symbol: i.Mb,
                amount: s,
                networkId: i.X8,
                toAddress: i.F0,
              }),
            }),
            d = await a.json()
          console.log("previewContent", d.content)
          let c = d.content?.previewResult?.previewId
          if (!c) return p.NextResponse.json({ error: "Failed to generate preview", details: d })
          let u = await fetch(`${i.MESH_BASE_URL}/transfers/managed/execute`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Client-Id": process.env.MESH_CLIENT_ID,
                "X-Client-Secret": process.env.MESH_CLIENT_SECRET_PROD,
              },
              body: JSON.stringify({ fromAuthToken: t, fromType: r, previewId: c, tryAnotherMfa: !0 }),
            }),
            f = await u.json()
          return f.content?.status === "mfaRequired"
            ? p.NextResponse.json({ mfaRequired: !0, previewId: c })
            : p.NextResponse.json(f)
        }
        let c = new n.AppRouteRouteModule({
            definition: {
              kind: o.RouteKind.APP_ROUTE,
              page: "/api/mesh/transfer-from-coinbase/route",
              pathname: "/api/mesh/transfer-from-coinbase",
              filename: "route",
              bundlePath: "app/api/mesh/transfer-from-coinbase/route",
            },
            resolvedPagePath: "/Users/harrysolovay/Desktop/1b1b1b1b/app/api/mesh/transfer-from-coinbase/route.ts",
            nextConfigOutput: "",
            userland: s,
          }),
          { workAsyncStorage: u, workUnitAsyncStorage: f, serverHooks: l } = c
        function m() {
          return (0, a.patchFetch)({ workAsyncStorage: u, workUnitAsyncStorage: f })
        }
      },
      2103: (e, t, r) => {
        "use strict"
        r.d(t, { F0: () => d, Gm: () => s, Mb: () => i, X8: () => p, b3: () => a })
        let s = (e) => new URL(e, "https://integration-api.meshconnect.com/api/v1").href,
          n = process.env.MESH_CLIENT_ID,
          o = process.env.MESH_CLIENT_SECRET_PROD,
          a = (e) => ({ "X-Client-Id": n, "X-Client-Secret": o, ...e ? { "Content-Type": "application/json" } : {} }),
          i = "ETH",
          p = "e3c7fdd8-b1fc-4e51-85ae-bb276e075611",
          d = "0xBc25f0f12472579a901B7f2F7F2e169065E26E7b"
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
  var r = (e) => t(t.s = e), s = t.X(0, [447, 580], () => r(1566))
  module.exports = s
})()
