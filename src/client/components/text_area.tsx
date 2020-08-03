import { color } from "@artsy/palette"
import { garamond } from "@artsy/reaction/dist/Assets/Fonts"
import React from "react"
import styled from "styled-components"

interface TextAreaProps extends React.HTMLProps<HTMLTextAreaElement> {
  error?: boolean
  block?: boolean
  hasError?: boolean
}

/**
 * @deprecated in favor of our Design System TextArea component in @artsy/palette
 * https://palette.artsy.net/elements/inputs/textarea
 */
const StyledTextArea: React.SFC<TextAreaProps> = props => {
  const newProps = { ...props }
  delete newProps.block
  return <textarea {...props} />
}

export const TextArea = styled(StyledTextArea)`
  padding: 10px;
  box-shadow: none;
  transition: border-color 0.25s;
  width: 100%;
  margin: 24px auto;
  margin-right: 10px;
  resize: none;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &::placeholder {
    color: ${color("black60")};
    text-overflow: ellipsis;
    line-height: normal;
  }
  ${garamond("s17")};
  border: 1px solid
    ${({ hasError }) => (hasError ? color("red100") : color("black60"))};
  transition: border-color 0.25s;

  &:hover,
  &:focus,
  &.focused {
    border-color: ${({ hasError }) =>
      hasError ? color("red100") : color("purple100")};
    outline: 0;
  }

  &:disabled {
    border: 2px dotted ${color("black60")};
  }
`
