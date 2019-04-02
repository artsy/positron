import { Box, Button, Separator, Serif } from "@artsy/palette"
import React from "react"

export const ArticlesListEmpty: React.SFC = () => {
  return (
    <Box mt={150} textAlign="center">
      <Serif size={6} weight="semibold">
        You haven’t written any articles yet.
      </Serif>

      <Separator width={50} mx="auto" my={2} />

      <Serif size={5}>
        Artsy Writer is a tool for writing stories about art on Artsy.
      </Serif>
      <Serif size={5} mb={2}>
        Get started by writing an article or reaching out to your liaison for
        help.
      </Serif>
      <a href="/articles/new">
        <Button>Write An Article</Button>
      </a>
    </Box>
  )
}
