import colors from "@artsy/reaction/dist/Assets/Colors"
import { avantgarde } from "@artsy/reaction/dist/Assets/Fonts"
import styled from "styled-components"

export const ButtonMedium = styled.button.attrs<{ background?: string }>({})`
  padding: 10px 20px;
  color: ${props => (props.color ? props.color : "white")};
  cursor: pointer;
  background: ${props =>
    props.background ? props.background : colors.grayMedium};
  ${avantgarde("s11")};
  outline: none;
  border: none;
  width: -moz-available;
  width: -webkit-fill-available;
  transition: background 0.3s;
  &:hover {
    background: ${colors.purpleRegular};
  }
`
