import { NextRequest, NextResponse } from "next/server"

// const MESH_SANDBOX_BASE_URL =
//   "https://sandbox-integration-api.meshconnect.com/api/v1";
const MESH_BASE_URL = "https://integration-api.meshconnect.com/api/v1"

export async function POST(req: NextRequest) {
  const {
    userId,
    integrationId,
    enableTransfers = true,
    transferOptions,
  } = await req.json()

  console.log("xfer ops", transferOptions)

  const meshBody: Record<string, unknown> = {
    userId,
    enableTransfers,
    restrictMultipleAccounts: true,
  }
  if (integrationId) meshBody.integrationId = integrationId
  if (transferOptions) meshBody.transferOptions = transferOptions

  const res = await fetch(`${MESH_BASE_URL}/linktoken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Id": process.env.MESH_CLIENT_ID!,
      "X-Client-Secret": process.env.MESH_CLIENT_SECRET_PROD!,
    },
    body: JSON.stringify(meshBody),
  })

  const { content } = await res.json()
  return NextResponse.json({ linkToken: content.linkToken })
}
