import StaticContainer from "found/StaticContainer"
import ElementsRenderer from "found/cjs/ElementsRenderer"
import { Box } from "@artsy/palette"
import { useEffect } from "react"
import { HttpError } from "found"
import { getENV } from "system/getENV"
import { ErrorPage } from "system/router/errors/ErrorPage"
import { AppShell } from "components/App/AppShell"

interface SetupRenderStatesProps {
  isInitialized: {
    current: boolean
  }
}

export const setupRenderStates = ({
  isInitialized,
}: SetupRenderStatesProps) => {
  return {
    /**
     * This is the render state that is called when a route is matched and a
     * request is fired off to metaphysics.
     */
    renderPending: () => {
      return (
        <>
          <Renderer>{null}</Renderer>
        </>
      )
    },

    /**
     * Once request is complete, render the page
     */
    renderReady: ({ elements }) => {
      return (
        <>
          <Renderer shouldUpdate>
            <RenderReady elements={elements} isInitialized={isInitialized} />
          </Renderer>
        </>
      )
    },

    /**
     * If there is an error, render the error page
     */
    renderError: ({ error }) => {
      const status = error.status || 500

      const message =
        getENV("NODE_ENV") === "development"
          ? String(error.data)
          : "Internal Error"

      // Server-side 404s are handled by the error handler middleware
      // @ts-expect-error need to configure jest types for v2
      if (typeof window === "undefined" && typeof jest === "undefined") {
        throw new HttpError(status, message)
      }

      return (
        <AppShell>
          <ErrorPage mt={4} code={status} message={message} />
        </AppShell>
      )
    },
  }
}

const RenderReady = ({ elements, isInitialized }) => {
  useEffect(() => {
    isInitialized.current = true
  }, [])

  return (
    <Box width="100%">
      <ElementsRenderer elements={elements} />
    </Box>
  )
}

const Renderer = ({ children, ...props }) => {
  return (
    <Box>
      <StaticContainer {...props}>{children}</StaticContainer>
    </Box>
  )
}
