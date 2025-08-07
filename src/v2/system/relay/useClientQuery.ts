import { useEffect, useState } from "react"
import {
  Environment,
  fetchQuery,
  GraphQLTaggedNode,
  useRelayEnvironment,
} from "react-relay"
import {
  CacheConfig,
  createOperationDescriptor,
  FetchQueryFetchPolicy,
  getRequest,
  OperationType,
} from "relay-runtime"

export const useClientQuery = <T extends OperationType>({
  environment,
  query,
  variables = {},
  cacheConfig = {},
  skip = false,
}: {
  environment?: Environment
  query: GraphQLTaggedNode
  variables?: T["variables"]
  cacheConfig?: {
    networkCacheConfig?: CacheConfig | null | undefined
    fetchPolicy?: FetchQueryFetchPolicy | null | undefined
  } | null
  skip?: boolean
  refetchQuery?: (variables: T["variables"]) => void
}) => {
  const relayEnvironment = useRelayEnvironment()

  const [data, setData] = useState<T["response"] | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState<boolean>(skip ? false : true)

  const operationDescriptor = createOperationDescriptor(
    getRequest(query),
    variables,
  )

  // Ensure that data is not garbage collected by Relay
  const disposable = relayEnvironment?.retain(operationDescriptor)

  const refetchQuery = async (variables) => {
    setLoading(true)

    try {
      const res = await fetchQuery<T>(
        environment || relayEnvironment,
        query,
        variables,
        cacheConfig,
      ).toPromise()

      setData(res)
      setLoading(false)
    } catch (err: any) {
      setError(err)
      disposable?.dispose()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (skip || data || error) return

    refetchQuery(variables)

    // https://github.com/facebook/react/issues/25149
    // Excludes `T`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cacheConfig,
    data,
    environment,
    error,
    query,
    relayEnvironment,
    skip,
    variables,
  ])

  return { data, error, loading, refetchQuery }
}
