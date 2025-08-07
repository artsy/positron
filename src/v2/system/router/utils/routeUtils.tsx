import { compact, uniq } from "lodash"
import { type MatchResult, match } from "path-to-regexp"
import { Route } from "system/router/Route"

export function getRoutes(): {
  routes: Route[]
  routePaths: string[]
  flatRoutes: Route[]
} {
  // Avoid circular dep
  const routes = require("routes").getAppRoutes()

  // Store all routes, including `children` routes, in a flat array. Useful for
  // lookup and other forms of introspection.
  const flatRoutes: Route[] = []

  const filterRoutes = (acc, route: Route, basePath = "") => {
    const path = compact([basePath, route.path]).join("/")

    const INVALID_PATHS = ["/", "*"]

    const isInvalid = INVALID_PATHS.some(
      (invalidPath) => route.path === invalidPath,
    )

    if (!isInvalid) {
      acc.push(path)
      flatRoutes.push({
        ...route,
        path: path,
      })
    }

    if (route.children) {
      return route.children.map((childRoute) =>
        filterRoutes(acc, childRoute, path),
      )
    }
  }

  const routePaths = routes.reduce((acc, route) => {
    filterRoutes(acc, route)
    return uniq(acc)
  }, [])

  return {
    routes,
    routePaths,
    flatRoutes,
  }
}

export const findCurrentRoute = (match): Route => {
  if (!match) {
    return {}
  }

  const { route: baseRoute, routes, routeIndices } = match

  if (!routeIndices || routeIndices.length === 0) {
    return baseRoute
  }
  const remainingRouteIndicies = [...routeIndices]
  let route = routes[remainingRouteIndicies.shift()]

  while (remainingRouteIndicies.length > 0) {
    route = route.children[remainingRouteIndicies.shift()]
  }

  if (!route) {
    route = baseRoute
  }

  return route
}

interface FindRoutesByPathProps {
  path: string
}

type RouteWithMatch = Array<{
  route: Route
  match: MatchResult<any>
}>

export function findRoutesByPath({
  path,
}: FindRoutesByPathProps): RouteWithMatch {
  const { flatRoutes = [] } = getRoutes()

  const foundRoutes = flatRoutes.reduce((acc: RouteWithMatch, route) => {
    const url = path.split("?")[0]

    const matcher = match(route.path as string, {
      decode: decodeURIComponent,
    })
    const matched = matcher(url)

    if (!matched) {
      return acc
    }

    return [
      ...acc,
      {
        route,
        match: matched,
      },
    ]
  }, [])

  return foundRoutes
}
