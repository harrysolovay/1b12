export const makeUrl = (pathname: string) => new URL(pathname, "https://integration-api.meshconnect.com/api/v1").href

export const clientId = process.env.MESH_CLIENT_ID!
export const secret = process.env.MESH_CLIENT_SECRET_PROD!

export const makeHeaders = (json?: boolean) => ({
  "X-Client-Id": clientId,
  "X-Client-Secret": secret,
  ...json
    ? {
      "Content-Type": "application/json",
    }
    : {},
})

export const SYM = "ETH"
export const NETWORK_ID = "e3c7fdd8-b1fc-4e51-85ae-bb276e075611"
export const destinationAddress = process.env.NEXT_PUBLIC_STORE_WALLET_ADDRESS
