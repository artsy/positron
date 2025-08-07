import { HomeApp } from "apps/home/HomeApp"
import { Route } from "system/router/Route"

export const homeRoutes: Route[] = [
  {
    path: "/",
    Component: HomeApp,
    // query: graphql
  },
]
