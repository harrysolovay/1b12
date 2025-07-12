import { makeHeaders, makeUrl } from "@/app/constants"
import { NextResponse } from "next/server"

export async function GET() {
  const headers = makeHeaders()
  const [networks, integrations] = await Promise.all([
    fetch(makeUrl("transfers/managed/networks"), { headers })
      .then((v) => v.json())
      .then((v) => v.content.networks),
    fetch(makeUrl("transfers/managed/integrations"), { headers })
      .then((v) => v.json())
      .then((v) => v.content.integrations),
  ])
  return NextResponse.json({
    networks,
    integrations,
  })
}
