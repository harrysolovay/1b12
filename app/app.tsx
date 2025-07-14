import { Button } from "@/components/ui/button"
import { createLink } from "@meshconnect/web-link-sdk"
import * as Effect from "effect/Effect"
import { useEffect, useRef, useState } from "react"
import { client } from "./client.ts"

export const App = () => {
  const [coinbaseAccessTokenDetails, setCoinbaseAccessTokenDetails] = useState<{
    accessToken: string
    refreshToken: string
  }>()
  const [metamaskAccessToken, setMetamaskAccessToken] = useState<string>()

  const [balances, setBalances] = useState<{
    coinbase?: number
    metamask?: number
  }>()

  const refreshCoinbaseTokenDetails = async () => {
    const details = coinbaseAccessTokenDetails
      ? await client.v1
        .refreshCoinbaseToken({
          payload: coinbaseAccessTokenDetails,
        })
        .pipe(Effect.runPromise)
      : undefined
    setCoinbaseAccessTokenDetails(details)
    return details
  }

  const refreshBalances = async () => {
    const details = await refreshCoinbaseTokenDetails()
    return client.v1
      .getBalances({
        payload: {
          coinbase: details?.accessToken,
          metamask: metamaskAccessToken,
        },
      })
      .pipe(Effect.runPromise)
      .then(setBalances)
  }

  useEffect(() => {
    if (coinbaseAccessTokenDetails || metamaskAccessToken) {
      refreshBalances()
    }
  }, [coinbaseAccessTokenDetails, metamaskAccessToken])

  const meshLinkRef = useRef(createLink({
    clientId: import.meta.env.VITE_MESH_CLIENT_ID,
    onIntegrationConnected: (payload) => {
      const { accessToken } = payload
      const token = accessToken?.accountTokens[0]
      if (!token) throw new Error()
      switch (accessToken?.brokerName) {
        case "Coinbase": {
          setCoinbaseAccessTokenDetails({
            accessToken: token.accessToken,
            refreshToken: token.refreshToken!,
          })
          break
        }
        case "MetaMask": {
          setMetamaskAccessToken(token.accessToken)
          break
        }
      }
    },
    onTransferFinished: (transferFinishedPayload) => {
      console.log({ transferFinishedPayload })
    },
    onExit: (error, summary) => {
      console.log({ error, summary })
    },
  }))

  const OpenLink = (_tag: "metamask" | "coinbase") => async () =>
    client.v1
      .createLinkToken({
        payload: { // TODO: fix typing
          _tag: _tag as never,
        },
      })
      .pipe(Effect.runPromise)
      .then(meshLinkRef.current.openLink)

  return (
    <>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6">
          <div>
            MetaMask (Balance: {balances?.metamask})
            <Button onClick={OpenLink("metamask")} className="w-full sm:w-auto">
              {metamaskAccessToken ? "Disconnect MetaMask" : "Connect MetaMask"}
            </Button>
          </div>
          <div>
            Coinbase (Balance: {balances?.coinbase})
            <Button onClick={OpenLink("coinbase")}>
              {coinbaseAccessTokenDetails ? "Disconnect Coinbase" : "Connect Coinbase"}
            </Button>
          </div>
        </div>

        {
          /* {coinbaseAccessToken && (
          <div className="mt-8 p-4 border rounded-md shadow-md bg-white/10">
            <h2 className="text-xl font-semibold mb-2">
              Coinbase USDC Balance
            </h2>
            <p className="text-lg mb-4">
              {balances.coinbase !== null
                ? `${balances.coinbase} ETH`
                : "Balance not loaded"}
            </p>
            <div className="flex gap-4">
              {mfaRequired && (
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="MFA"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    className="border p-2 rounded"
                  />
                  <Button
                    onClick={async () => {
                      const accessToken = localStorage.getItem("coinbaseAccessToken")!
                      const brokerType = localStorage.getItem("coinbaseBrokerType")!

                      const { executeTransferResult } = await client.v1.transferFromCoinbaseMfa({
                        payload: {
                          accessToken: Redacted.make(accessToken),
                          brokerType: brokerType as never,
                          previewId: previewId!,
                          mfaCode,
                        },
                      }).pipe(Effect.runPromise)
                      setMfaRequired(false)
                      setMfaCode("")
                      console.log({ executeTransferResult })
                    }}
                  >
                    Confirm MFA
                  </Button>
                </div>
              )}
            </div>
          </div>
        )} */
        }
      </div>

      {
        /* <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalStage === "summary" && "Confirm Your Payment"}
              {modalStage === "mfa" && "Enter MFA Code"}
              {modalStage === "success" && "Payment Successful"}
              {modalStage === "error" && "Payment Failed"}
            </DialogTitle>
          </DialogHeader>

          {modalStage === "summary" && (
            <div className="space-y-4">
              <p>Total to pay something</p>
              <DialogFooter>
                <Button
                  onClick={async () => {
                    const accessToken = localStorage.getItem("coinbaseAccessToken")!
                    const brokerType = localStorage.getItem("coinbaseBrokerType")!

                    const result = await client.v1.transferFromCoinbase({
                      payload: {
                        accessToken: Redacted.make(accessToken),
                        brokerType: brokerType as never,
                        amount: .0001,
                      },
                    }).pipe(Effect.runPromise)
                    if (result._tag === "mfa") {
                      setPreviewId(result.previewId)
                      setModalStage("mfa")
                    } else if (result.content.status === "succeeded") {
                      setModalStage("success")
                    } else {
                      setTransferError("Transfer failed. Try again.")
                      setModalStage("error")
                    }
                  }}
                >
                  Confirm Payment
                </Button>
              </DialogFooter>
            </div>
          )}

          {modalStage === "mfa" && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter MFA Code"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                className="border w-full p-2 rounded"
              />
              <DialogFooter>
                <Button
                  onClick={async () => {
                    const accessToken = localStorage.getItem("coinbaseAccessToken")!
                    const brokerType = localStorage.getItem("coinbaseBrokerType")!

                    const result = await client.v1.transferFromCoinbaseMfa({
                      payload: {
                        accessToken: Redacted.make(accessToken),
                        brokerType: brokerType as never,
                        previewId: previewId!,
                        mfaCode,
                      },
                    }).pipe(
                      Effect.map(Struct.get("executeTransferResult")),
                      Effect.flatMap(Effect.fromNullable),
                      Effect.runPromise,
                    )
                    if (result.status === "succeeded") {
                      setModalStage("success")
                    } else {
                      setTransferError("MFA failed. Try again.")
                      setModalStage("error")
                    }
                  }}
                >
                  Confirm MFA
                </Button>
              </DialogFooter>
            </div>
          )}

          {modalStage === "success" && (
            <div className="text-center space-y-4">
              <p>Your payment was processed successfully.</p>
              <DialogFooter>
                <Button onClick={() => setIsModalOpen(false)}>Close</Button>
              </DialogFooter>
            </div>
          )}

          {modalStage === "error" && (
            <div className="text-center space-y-4 text-red-600">
              <p>{transferError}</p>
              <DialogFooter>
                <Button onClick={() => setIsModalOpen(false)}>Close</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog> */
      }
    </>
  )
}
