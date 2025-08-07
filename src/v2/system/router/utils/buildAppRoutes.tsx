import { AppShell } from "components/App/AppShell"
import { RouteObject, withRouter } from "found"
import { useEffect } from "react"
import { interceptLinks } from "system/router/utils/interceptLinks"

/**
 * Return a top-level "meta" route containing all global sub-routes, which is
 * then mounted into the router.
 */

export const buildAppRoutes = (routes: RouteObject[]) => {
  const children = routes.flat()

  const Component: any = props => {
    useEffect(() => {
      /**
       * Intercept <a> tags on page and if contained within routes.ts then
       * forward to router and transition within the SPA, rather than performing
       * hard jumps between pages.
       */
      interceptLinks({
        router: props.router,
        routes: children,
      })
    }, [])

    return <AppShell>{props.children}</AppShell>
  }

  return [
    {
      path: "",
      Component: withRouter(Component),
      children,
    },
  ]
}
