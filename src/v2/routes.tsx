import { homeRoutes } from "apps/home/homeRoutes"
import { RouteConfig } from "found"
import { buildAppRoutes } from "system/router/utils/buildAppRoutes"

export const getAppRoutes = (): RouteConfig => {
  return buildAppRoutes([homeRoutes])
}
