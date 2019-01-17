import { color, Sans } from "@artsy/palette"
import React from "react"
import styled from "styled-components"

interface SansLabelProps {
  children: any
  isRequired?: boolean
}

export const FormLabel: React.SFC<SansLabelProps> = props => {
  const { children, isRequired } = props

  return (
    <Sans size="3t" weight="medium">
      {children}
      {isRequired && <Required>*</Required>}
    </Sans>
  )
}

const Required = styled.span`
  color: ${color("red100")};
  font-size: 120%;
  margin-left: 2px;
`
