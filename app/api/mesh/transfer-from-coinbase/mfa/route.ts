import { makeHeaders, makeUrl } from "@/app/constants"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { accessToken, brokerType, previewId, mfaCode } = await req.json()

  const execRes = await fetch(makeUrl("transfers/managed/execute"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...makeHeaders(),
    },
    body: JSON.stringify({
      fromAuthToken: accessToken,
      fromType: brokerType,
      previewId,
      tryAnotherMfa: false,
      mfaCode,
    }),
  })
  const exec = await execRes.json()
  return NextResponse.json(exec)
}
