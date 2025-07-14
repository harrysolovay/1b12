import { Provider as JotaiProvider } from "jotai"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "react-query"
import "@fontsource/inconsolata/index.css"
import "./global.css"
import { ClerkProvider } from "@clerk/clerk-react"
import * as Schema from "effect/Schema"
import { App } from "./app.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={new QueryClient()}>
      <JotaiProvider>
        <ClerkProvider
          afterSignOutUrl="/"
          publishableKey={Schema.decodeUnknownSync(Schema.String)(
            import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
          )}
        >
          <App />
        </ClerkProvider>
      </JotaiProvider>
    </QueryClientProvider>
  </StrictMode>,
)
