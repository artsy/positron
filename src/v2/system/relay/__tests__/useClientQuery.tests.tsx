import { renderHook, waitFor } from "@testing-library/react"
import { graphql, RelayEnvironmentProvider } from "react-relay"
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils"
import { useClientQuery } from "system/relay/useClientQuery"

jest.unmock("react-relay")

const TEST_QUERY = graphql`
  query useClientQueryTestQuery {
    artwork(id: "example") {
      id
    }
  }
`

describe("useClientQuery", () => {
  it("executes the query, updating the loading state", async () => {
    const environment = createMockEnvironment()

    const { result } = renderHook(
      () => useClientQuery({ environment, query: TEST_QUERY }),
      {
        wrapper: ({ children }) => (
          <RelayEnvironmentProvider environment={environment}>
            {children}
          </RelayEnvironmentProvider>
        ),
      },
    )

    environment.mock.resolveMostRecentOperation((operation) => {
      return MockPayloadGenerator.generate(operation, {
        Artwork: () => ({ id: "example" }),
      })
    })

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.data).toEqual({ artwork: { id: "example" } })
      expect(result.current.loading).toBe(false)
    })
  })

  it("skips the query if 'skip' is true", () => {
    const environment = createMockEnvironment()

    const { result } = renderHook(
      () => useClientQuery({ query: TEST_QUERY, skip: true }),
      {
        wrapper: ({ children }) => (
          <RelayEnvironmentProvider environment={environment}>
            {children}
          </RelayEnvironmentProvider>
        ),
      },
    )

    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(false)
  })
})
