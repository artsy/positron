import { Theme } from "@artsy/palette"
import { RelayEnvironmentProvider } from "react-relay"
import { createRelayEnvironment } from "system/relay/relayEnvironment"

export const Boot = ({ children }) => {
  const relayEnvironment = createRelayEnvironment()

  return (
    <Theme theme="light">
      <RelayEnvironmentProvider environment={relayEnvironment}>
        {children}
      </RelayEnvironmentProvider>{" "}
    </Theme>
  )
}
