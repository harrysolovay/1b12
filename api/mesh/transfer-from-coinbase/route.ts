import { destinationAddress, makeHeaders, makeUrl, NETWORK_ID, SYM } from "@/app/constants"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { accessToken, brokerType, amount } = await req.json()
  const confRes = await fetch(makeUrl("transfers/managed/configure"), {
    method: "POST",
    headers: makeHeaders(),
    body: JSON.stringify({
      fromAuthToken: accessToken,
      fromType: brokerType,
      symbol: "ETH",
      amount,
      toAddresses: [
        {
          networkId: NETWORK_ID,
          symbol: "ETH",
          address: destinationAddress,
        },
      ],
      networkId: NETWORK_ID,
    }),
  })
  const conf = await confRes.json()
  console.log("conf holdings", conf?.content?.holdings)

  const previewRes = await fetch(makeUrl("transfers/managed/preview"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...makeHeaders(),
    },
    body: JSON.stringify({
      fromAuthToken: accessToken,
      fromType: brokerType,
      symbol: SYM,
      amount,
      networkId: NETWORK_ID,
      toAddress: destinationAddress,
    }),
  })

  const preview = await previewRes.json()
  console.log("previewContent", preview.content)
  const previewId = preview.content?.previewResult?.previewId

  if (!previewId) {
    return NextResponse.json({
      error: "Failed to generate preview",
      details: preview,
    })
  }

  const execRes = await fetch(makeUrl("transfers/managed/execute"), {
    method: "POST",
    headers: makeHeaders(true),
    body: JSON.stringify({
      fromAuthToken: accessToken,
      fromType: brokerType,
      previewId,
      tryAnotherMfa: true,
    }),
  })

  const execJson = await execRes.json()
  if (execJson.content?.status === "mfaRequired") {
    return NextResponse.json({ mfaRequired: true, previewId })
  }

  return NextResponse.json(execJson)
}
