import { PageLoadingBar } from "components/App/PageLoadingBar"
import type { Match } from "found"
import type * as React from "react"

interface AppShellProps {
  children: React.ReactNode
  match?: Match
}

export const AppShell: React.FC<AppShellProps> = props => {
  const { children, match } = props

  const showLoader = !match?.elements

  return (
    <>
      <PageLoadingBar loadingState={showLoader ? "loading" : "complete"} />

      {/* Layout here */}
      {children}
    </>
  )
}

