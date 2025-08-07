import { MiddlewareNextFn, RelayRequestAny } from "react-relay-network-modern"

/**
 * Relay middleware that tracks network requests and sets isFirstRender to false
 * after the first successful GraphQL operation completes.
 *
 * This first render model is how we're able to only show loading skeletons on
 * the very first rending of the app. All subsequent renders are in an SPA
 * context and we can use the top loading bar via AppShell.
 */
export const firstRenderMiddleware = () => {
  let hasCompletedFirstOperation = false

  // Initialize the global isFirstRender flag in the Volt namespace
  window.isFirstRender = true

  return (next: MiddlewareNextFn) => (req: RelayRequestAny) => {
    // Skip if we've already completed the first operation
    if (hasCompletedFirstOperation) {
      return next(req)
    }

    return next(req).then(res => {
      // If this is the first successful operation
      if (!hasCompletedFirstOperation) {
        hasCompletedFirstOperation = true

        // Set isFirstRender to false after first successful operation
        window.isFirstRender = false
      }

      return res
    })
  }
}
