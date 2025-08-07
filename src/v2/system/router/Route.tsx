import { Location, Params, RouteObjectBase } from "found"
import { GraphQLTaggedNode } from "react-relay"
import { CacheConfig, FetchPolicy } from "relay-runtime"

export interface Route extends RouteObjectBase {
  // Component: React.ComponentType<any>
  children: any
  prepareVariables?: (params: any, props: PrepareVariablesProps) => object
  query?: GraphQLTaggedNode
  /** Relay cacheConfig; use `force: true` to always refetch */
  cacheConfig?: CacheConfig
  fetchPolicy?: FetchPolicy
  preloadJS?: () => void
}

export interface PrepareVariablesProps {
  context: any
  location: Location
  params: Params
  route: Route
}
