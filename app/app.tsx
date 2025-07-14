import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut, SignInButton, useAuth, UserButton } from "@clerk/clerk-react"
import { type AccountToken, createLink } from "@meshconnect/web-link-sdk"
import * as Effect from "effect/Effect"
import { useRef } from "react"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { client } from "./client.ts"

export const App = () => {
  const queryClient = useQueryClient()
  const { isSignedIn } = useAuth()

  const { data: userInfo } = useQuery({
    queryKey: ["balances", isSignedIn],
    queryFn: async () =>
      isSignedIn
        ? client.v1.getUserInfo().pipe(Effect.runPromise)
        : undefined,
  })
  console.log({ userInfo })

  const createCoinbaseLinkToken = useMutation({
    mutationKey: ["createCoinbaseLinkToken"],
    mutationFn: async () =>
      client.v1
        .createLinkToken({
          payload: {
            source: "coinbase",
          },
        })
        .pipe(Effect.runPromise)
        .then(meshLinkRef.current.openLink),
  })

  const saveCoinbaseAccessToken = useMutation({
    mutationKey: ["saveCoinbaseAccessToken"],
    mutationFn: async (token: AccountToken) =>
      client.v1
        .saveCoinbaseTokens({
          payload: {
            accessToken: token.accessToken,
            refreshToken: token.refreshToken!,
          },
        })
        .pipe(Effect.runPromise),
    onSuccess: () => queryClient.invalidateQueries(["balances"]),
  })

  const saveMetamaskAccessToken = useMutation({
    mutationKey: ["saveCoinbaseAccessToken"],
    mutationFn: async (token: AccountToken) =>
      client.v1
        .saveMetamaskToken({
          payload: {
            accessToken: token.accessToken,
          },
        })
        .pipe(Effect.runPromise),
    onSuccess: () => queryClient.invalidateQueries(["balances"]),
  })

  const createMetamaskLinkToken = useMutation({
    mutationKey: ["createMetamaskLinkToken"],
    mutationFn: async () =>
      client.v1
        .createLinkToken({
          payload: {
            source: "metamask",
          },
        })
        .pipe(Effect.runPromise)
        .then(meshLinkRef.current.openLink),
  })

  const meshLinkRef = useRef(createLink({
    clientId: import.meta.env.VITE_MESH_CLIENT_ID,
    onIntegrationConnected: async (payload) => {
      const { accessToken } = payload
      const token = accessToken?.accountTokens[0]!
      switch (accessToken?.brokerName) {
        case "Coinbase": {
          saveCoinbaseAccessToken.mutate(token)
          break
        }
        case "MetaMask": {
          saveMetamaskAccessToken.mutate(token)
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
  return (
    <div>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6">
          <div>
            <div>MetaMask</div>
            {userInfo?.metamask.connected
              ? `(Balance: ${userInfo.metamask.balance})`
              : <Button onClick={() => createMetamaskLinkToken.mutate()}>Connect MetaMask</Button>}
          </div>
          <div>
            Coinbase
            {userInfo?.coinbase.connected
              ? `(Balance: ${userInfo.coinbase.balance})`
              : <Button onClick={() => createCoinbaseLinkToken.mutate()}>Connect Coinbase</Button>}
          </div>
        </div>
      </div>
    </div>
  )
}
