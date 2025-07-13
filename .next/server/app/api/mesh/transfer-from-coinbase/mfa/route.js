;(() => {
  var e = {}
  e.id = 100,
    e.ids = [100],
    e.modules = {
      846: (e) => {
        "use strict"
        e.exports = require("next/dist/compiled/next-server/app-page.runtime.prod.js")
      },
      2103: (e, r, t) => {
        "use strict"
        t.d(r, { F0: () => u, Gm: () => s, Mb: () => i, X8: () => p, b3: () => o })
        let s = (e) => new URL(e, "https://integration-api.meshconnect.com/api/v1").href,
          a = process.env.MESH_CLIENT_ID,
          n = process.env.MESH_CLIENT_SECRET_PROD,
          o = (e) => ({ "X-Client-Id": a, "X-Client-Secret": n, ...e ? { "Content-Type": "application/json" } : {} }),
          i = "ETH",
          p = "e3c7fdd8-b1fc-4e51-85ae-bb276e075611",
          u = "0xBc25f0f12472579a901B7f2F7F2e169065E26E7b"
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
      6535: (e, r, t) => {
        "use strict"
        t.r(r),
          t.d(r, {
            patchFetch: () => l,
            routeModule: () => c,
            serverHooks: () => m,
            workAsyncStorage: () => d,
            workUnitAsyncStorage: () => f,
          })
        var s = {}
        t.r(s), t.d(s, { POST: () => u })
        var a = t(6559), n = t(8088), o = t(7719), i = t(2103), p = t(2190)
        async function u(e) {
          let { accessToken: r, brokerType: t, previewId: s, mfaCode: a } = await e.json(),
            n = await fetch(`${i.MESH_BASE_URL}/transfers/managed/execute`, {
              method: "POST",
              headers: { "Content-Type": "application/json", ...i.b3 },
              body: JSON.stringify({ fromAuthToken: r, fromType: t, previewId: s, tryAnotherMfa: !1, mfaCode: a }),
            }),
            o = await n.json()
          return p.NextResponse.json(o)
        }
        let c = new a.AppRouteRouteModule({
            definition: {
              kind: n.RouteKind.APP_ROUTE,
              page: "/api/mesh/transfer-from-coinbase/mfa/route",
              pathname: "/api/mesh/transfer-from-coinbase/mfa",
              filename: "route",
              bundlePath: "app/api/mesh/transfer-from-coinbase/mfa/route",
            },
            resolvedPagePath: "/Users/harrysolovay/Desktop/1b1b1b1b/app/api/mesh/transfer-from-coinbase/mfa/route.ts",
            nextConfigOutput: "",
            userland: s,
          }),
          { workAsyncStorage: d, workUnitAsyncStorage: f, serverHooks: m } = c
        function l() {
          return (0, o.patchFetch)({ workAsyncStorage: d, workUnitAsyncStorage: f })
        }
      },
      8335: () => {},
      9294: (e) => {
        "use strict"
        e.exports = require("next/dist/server/app-render/work-async-storage.external.js")
      },
    }
  var r = require("../../../../../webpack-runtime.js")
  r.C(e)
  var t = (e) => r(r.s = e), s = r.X(0, [447, 580], () => t(6535))
  module.exports = s
})()
