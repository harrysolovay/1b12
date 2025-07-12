"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createLink, LinkPayload } from "@meshconnect/web-link-sdk"
import { useCallback, useEffect, useState } from "react"

type ModalStage = "summary" | "mfa" | "success" | "error"

export default function Home() {
  const [isCoinbaseConnected, setIsCoinbaseConnected] = useState<boolean>(false)
  const [ethBalance, setEthBalance] = useState<number | null>(null)

  const [previewId, setPreviewId] = useState<string | null>(null)
  const [mfaRequired, setMfaRequired] = useState<boolean>(false)
  const [mfaCode, setMfaCode] = useState<string>("")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalStage, setModalStage] = useState<ModalStage>("summary")
  const [transferError, setTransferError] = useState<string | null>(null)

  const [isDeFiWalletConnected, setIsDeFiWalletConnected] = useState(false)
  const [walletUSDC, setWalletUSDC] = useState<number | null>(null)

  const fetchWalletHoldings = async () => {
    const accessToken = localStorage.getItem("defiAccessToken")
    if (!accessToken) return
    const res = await fetch("/api/mesh/get-wallet-portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken }),
    })

    const json = await res.json()
    console.log(json)
    const { balance } = json
    setWalletUSDC(balance)
  }

  useEffect(() => {
    if (isDeFiWalletConnected) {
      fetchWalletHoldings()
    }
  }, [isDeFiWalletConnected])

  const meshLinkRef = createLink({
    clientId: process.env.NEXT_PUBLIC_MESH_CLIENT_ID!,
    onIntegrationConnected: (pl: LinkPayload) => {
      console.log("Connected:", pl)
      if (pl.accessToken?.brokerType === "deFiWallet") {
        const tokenObj = pl.accessToken.accountTokens?.[0]
        if (tokenObj) {
          localStorage.setItem("defiAccessToken", tokenObj.accessToken)
          setIsDeFiWalletConnected(true)
        }
      }

      if (pl.accessToken?.brokerType === "coinbase") {
        localStorage.setItem("coinbaseConnected", "true")

        const tokenObj = pl.accessToken.accountTokens?.[0]
        if (tokenObj) {
          localStorage.setItem("coinbaseAccessToken", tokenObj.accessToken)
          localStorage.setItem("coinbaseBrokerType", pl.accessToken.brokerType)
        }

        setIsCoinbaseConnected(true)
      }
    },
    onTransferFinished: (tx) => {
      console.log("Transfer:", tx)
      fetchWalletHoldings()
    },
    onExit: (err, summary) => console.log("Closed:", err, summary),
  })

  const handlePayWithDeFiWallet = useCallback(async () => {
    const req = await fetch("/api/mesh/link-token", {
      method: "POST",
      body: JSON.stringify({
        userId: "end-user-123-abc",
        enableTransfers: false,
        integrationId: "34aeb688-decb-485f-9d80-b66466783394",
        transferOptions: {
          toAddresses: [
            {
              networkId: "e3c7fdd8-b1fc-4e51-85ae-bb276e075611",
              symbol: "ETH",
              address: process.env.NEXT_PUBLIC_STORE_WALLET_ADDRESS,
            },
          ],
        },
      }),
      headers: { "Content-Type": "application/json" },
    })
    const { linkToken } = await req.json()
    meshLinkRef.openLink(linkToken)
  }, [meshLinkRef])

  const handleConnectCoinbase = useCallback(async () => {
    const res = await fetch("/api/mesh/link-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "end-user-123",
        integrationId: process.env.NEXT_PUBLIC_COINBASE_ID,
        enableTransfers: false,
      }),
    })

    const { linkToken } = await res.json()
    meshLinkRef.openLink(linkToken)
  }, [meshLinkRef])

  const handleDisconnectCoinbase = () => {
    localStorage.removeItem("coinbaseConnected")
    setIsCoinbaseConnected(false)
    setEthBalance(null)
    console.log("Coinbase disconnected")
  }

  useEffect(() => {
    const coinbaseConnected = localStorage.getItem("coinbaseConnected") === "true"
    if (coinbaseConnected) setIsCoinbaseConnected(true)
  }, [])

  return (
    <>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6">
          <Button
            onClick={handlePayWithDeFiWallet}
            className="w-full sm:w-auto"
          >
            Top up with my DeFi Wallet 🦊
          </Button>
          <Button
            onClick={isCoinbaseConnected
              ? handleDisconnectCoinbase
              : handleConnectCoinbase}
            className="w-full sm:w-auto"
          >
            {isCoinbaseConnected
              ? "Disconnect Coinbase ❌"
              : "Connect my Coinbase Account 🔵"}
          </Button>
        </div>

        {isDeFiWalletConnected && (
          <div className="mt-8 p-4 border rounded-md shadow-md bg-white/10">
            <h2 className="text-xl font-semibold mb-2">
              MetaMask USDC Balance
            </h2>
            <p className="text-lg">
              {typeof walletUSDC === "number"
                ? `${walletUSDC.toFixed(4)} USDC`
                : walletUSDC === null
                ? "Loading..."
                : "Balance unavailable"}
            </p>
          </div>
        )}

        {isCoinbaseConnected && (
          <div className="mt-8 p-4 border rounded-md shadow-md bg-white/10">
            <h2 className="text-xl font-semibold mb-2">
              Coinbase USDC Balance
            </h2>
            <p className="text-lg mb-4">
              {ethBalance !== null
                ? `${ethBalance} ETH`
                : "Balance not loaded"}
            </p>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={async () => {
                  const accessToken = localStorage.getItem(
                    "coinbaseAccessToken",
                  )
                  const brokerType = localStorage.getItem("coinbaseBrokerType")
                  if (!accessToken || !brokerType) {
                    console.log("Tokens not found, returning...")
                    return
                  }

                  const res = await fetch("/api/mesh/get-coinbase-balance", {
                    method: "POST",
                    body: JSON.stringify({ accessToken, brokerType }),
                    headers: { "Content-Type": "application/json" },
                  })
                  const json = await res.json()
                  console.log({ json })
                  const { balance } = json
                  setEthBalance(Number(balance))
                }}
              >
                Load Balance
              </Button>
              <Button
                onClick={() => {
                  setModalStage("summary")
                  setIsModalOpen(true)
                }}
              >
                Pay with Coinbase 💳
              </Button>
              {mfaRequired && (
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Código MFA"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    className="border p-2 rounded"
                  />
                  <Button
                    onClick={async () => {
                      const accessToken = localStorage.getItem(
                        "coinbaseAccessToken",
                      )
                      const brokerType = localStorage.getItem("coinbaseBrokerType")

                      const res = await fetch(
                        "/api/mesh/transfer-from-coinbase/mfa",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            accessToken,
                            brokerType,
                            previewId,
                            mfaCode,
                          }),
                        },
                      )
                      const json = await res.json()
                      if (
                        json.content?.executeTransferResult?.status
                          === "succeeded"
                      ) {
                        alert("✅ Transfer completed!")
                        setMfaRequired(false)
                        setMfaCode("")
                      } else {
                        console.error("❌ Error en MFA:", json)
                      }
                    }}
                  >
                    Confirmar MFA
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalStage === "summary" && "Confirm Your Payment"}
              {modalStage === "mfa" && "Enter MFA Code"}
              {modalStage === "success" && "✅ Payment Successful"}
              {modalStage === "error" && "❌ Payment Failed"}
            </DialogTitle>
          </DialogHeader>

          {modalStage === "summary" && (
            <div className="space-y-4">
              <p>Total to pay something</p>
              <DialogFooter>
                <Button
                  onClick={async () => {
                    const accessToken = localStorage.getItem(
                      "coinbaseAccessToken",
                    )
                    const brokerType = localStorage.getItem("coinbaseBrokerType")

                    const res = await fetch(
                      "/api/mesh/transfer-from-coinbase",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          accessToken,
                          brokerType,
                          amount: .0001,
                        }),
                      },
                    )

                    const json = await res.json()

                    if (json.mfaRequired) {
                      setPreviewId(json.previewId)
                      setModalStage("mfa")
                    } else if (
                      json.content?.executeTransferResult?.status
                        === "succeeded"
                    ) {
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
                    const accessToken = localStorage.getItem(
                      "coinbaseAccessToken",
                    )
                    const brokerType = localStorage.getItem("coinbaseBrokerType")

                    const res = await fetch(
                      "/api/mesh/transfer-from-coinbase/mfa",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          accessToken,
                          brokerType,
                          previewId,
                          mfaCode,
                        }),
                      },
                    )

                    const json = await res.json()

                    if (
                      json.content?.executeTransferResult?.status
                        === "succeeded"
                    ) {
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
      </Dialog>
    </>
  )
}
