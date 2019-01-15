import { Sans } from "@artsy/palette"
import React from "react"

interface SansLabelProps {
  children: any
}

export const FormLabel: React.SFC<SansLabelProps> = props => {
  return (
    <Sans size="3t" weight="medium">
      {props.children}
    </Sans>
  )
}
