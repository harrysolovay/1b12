import { makeHeaders, makeUrl } from "@/app/constants"
import { BrokerType, HoldingsModel, HoldingsRequest } from "@meshconnect/node-api"
import { NextRequest, NextResponse } from "next/server"

export interface GetCoinbaseBalancePayload {
  accessToken: string
  brokerType: BrokerType
}

export async function POST(req: NextRequest) {
  const { accessToken, brokerType }: GetCoinbaseBalancePayload = await req.json()
  const res = await fetch(makeUrl("holdings/get"), {
    method: "POST",
    headers: makeHeaders(true),
    body: JSON.stringify(
      {
        authToken: accessToken,
        type: brokerType,
        includeMarketValue: true,
      } satisfies HoldingsRequest,
    ),
  })
  const { content: { cryptocurrencyPositions } } = await res.json() as {
    content: Pick<HoldingsModel, "cryptocurrencyPositions">
  }
  const eth = cryptocurrencyPositions?.find((h) => h.symbol === "ETH")
  return NextResponse.json({
    balance: eth?.amount ?? 0,
  })
}
