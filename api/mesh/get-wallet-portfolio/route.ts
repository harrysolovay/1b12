import { NextRequest, NextResponse } from "next/server"

const MESH_BASE_URL = "https://integration-api.meshconnect.com/api/v1"

interface CryptoPosition {
  symbol: string
  amount: number
  marketValue?: number
  costBasis?: number
}

interface HoldingsResponse {
  content: {
    cryptocurrencyPositions?: CryptoPosition[]
  }
}

export async function POST(req: NextRequest) {
  const { accessToken } = await req.json()

  const res = await fetch(`${MESH_BASE_URL}/holdings/get`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Id": process.env.MESH_CLIENT_ID!,
      "X-Client-Secret": process.env.MESH_CLIENT_SECRET_PROD!,
    },
    body: JSON.stringify({
      authToken: accessToken,
      type: "deFiWallet",
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    console.error("Failed to fetch portfolio holdings:", error)
    return NextResponse.json(
      { error: "Failed to fetch holdings" },
      { status: 500 },
    )
  }

  const data: HoldingsResponse = await res.json()

  const eth = data.content.cryptocurrencyPositions?.find(
    (p) => p.symbol === "ETH",
  )

  return NextResponse.json({ balance: eth?.amount ?? 0 })
}
