import { Flex } from "@artsy/palette"
import React from "react"

export const EditSectionPlaceholder: React.SFC<{ children: any }> = ({
  children,
}) => {
  return (
    <Flex height="150px" justifyContent="center" alignItems="center">
      {children}
    </Flex>
  )
}
