import { Environment, RecordSource, Store } from "relay-runtime"
import {
  RelayNetworkLayer,
  urlMiddleware,
  loggerMiddleware,
  cacheMiddleware,
  errorMiddleware,
} from "react-relay-network-modern"
import { getENV } from "system/getENV"
import { firstRenderMiddleware } from "system/relay/firstRenderMiddleware"

export const createRelayEnvironment = (): Environment => {
  console.log(process.env.DATADOG_AGENT_HOSTNAME)
  const url = getENV("METAPHYSICS_URL")

  const authenticatedHeaders = (() => {
    // if (window.Volt.currentUser.id) {
    //   return {
    //     "X-USER-ID": window.Volt.currentUser.id,
    //     "X-ACCESS-TOKEN": window.Volt.currentUser.accessToken,
    //   }
    // }
    return {}
  })()

  const network = new RelayNetworkLayer(
    [
      urlMiddleware({
        url,
        headers: {
          "X-TIMEZONE": Intl.DateTimeFormat().resolvedOptions().timeZone,
          "X-CMS-Request": "true",
          ...authenticatedHeaders,
        },
      }),
      cacheMiddleware({
        size: 100,
        ttl: 20 * 60 * 1000, // 20 minutes
        clearOnMutation: true,
      }),
      loggerMiddleware(),
      errorMiddleware({
        disableServerMiddlewareTip: true,
      }),
      firstRenderMiddleware(),
    ],
    // TODO: Look closer at forces config for more advanced error handling.
    { noThrow: true }
  )
  const source = new RecordSource()
  const store = new Store(source)
  const relayEnvironment = new Environment({ network, store })
  return relayEnvironment
}
