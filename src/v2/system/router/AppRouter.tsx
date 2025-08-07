import { BrowserProtocol, createQueryMiddleware } from "farce"
import { Resolver } from "found-relay"
import { createFarceRouter, createRender } from "found"
import RelayModernEnvironment from "relay-runtime/lib/store/RelayModernEnvironment"
import { useEffect, useRef } from "react"
import { getAppRoutes } from "routes"
import { ScrollManager } from "found-scroll"
import { setupRenderStates } from "system/router/RenderStates"
import { pageViewTrackingMiddleware } from "system/router/utils/pageViewTrackingMiddleware"
import { parseQueryString } from "system/router/utils/parseQueryString"
import qs from "qs"
import { useRelayEnvironment } from "react-relay"

export const AppRouter: React.FC = () => {
  const relayEnvironment = useRelayEnvironment()

  const isInitialized = useRef(false)

  const resolver = new Resolver(relayEnvironment as RelayModernEnvironment)

  const routeConfig = getAppRoutes()

  const render = createRender(
    // @ts-ignore
    setupRenderStates({
      isInitialized: isInitialized,
    }),
  )

  const Router = createFarceRouter({
    historyProtocol: new BrowserProtocol(),
    historyMiddlewares: [
      createQueryMiddleware({
        parse: parseQueryString,
        stringify: qs.stringify,
      }),
      pageViewTrackingMiddleware(),
    ],
    routeConfig,
    render: (renderArgs) => {
      const ignoreScroll = renderArgs.location?.state?.ignoreScroll

      return (
        <ScrollManager
          renderArgs={renderArgs as any}
          shouldUpdateScroll={() => !ignoreScroll}
        >
          {render(renderArgs)}
        </ScrollManager>
      )
    },
  })

  // Disable turbolinks in router pages on mount
  useEffect(() => {
    window.disableTurbolinks = true
  }, [])

  // On the very first app render (on mount, or when deeplinking into page) we
  // show a loading skeleton while data is fetching. On subsequent renders we
  // show a page loading bar.
  const isFirstRender = () => {
    return window.isFirstRender !== false
  }

  return (
    <>
      <Router
        matchContext={
          {
            isFirstRender,
          }
        }
        resolver={resolver}
      />
    </>
  )
}
