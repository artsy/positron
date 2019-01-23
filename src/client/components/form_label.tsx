import { color as systemColor, Sans } from "@artsy/palette"
import React from "react"
import styled from "styled-components"

interface SansLabelProps {
  children: any
  color?: string
  isRequired?: boolean
}

export const FormLabel: React.SFC<SansLabelProps> = props => {
  const { children, color, isRequired } = props

  return (
    <Sans size="3t" weight="medium" color={color || "black100"}>
      {children}
      {isRequired && <Required>*</Required>}
    </Sans>
  )
}

const Required = styled.span`
  color: ${systemColor("red100")};
  font-size: 120%;
  margin-left: 2px;
`
