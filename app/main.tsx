import { Provider as JotaiProvider } from "jotai"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "react-query"
import "@fontsource/libre-baskerville/index.css"
import "@fontsource/inconsolata/index.css"
import "./global.css"
import { App } from "./app.tsx"

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <App />
      </JotaiProvider>
    </QueryClientProvider>
  </StrictMode>,
)

// const setUserInfo = useSetAtom(UserInfo)
// const { data: userInfo, isLoading: userInfoLoading } = useQuery({
//   queryKey: "userInfo",
//   queryFn: getUserInfo,
//   onSuccess: setUserInfo,
// })
// return !userInfoLoading && (
//   <div className="h-svh antialiased">
//     <LandingPage />
//     {import.meta.env.DEV && false && <WidthIndicator />}
//   </div>
// )
