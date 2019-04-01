import React from "react"
import styled from "styled-components"

interface ModalBackgroundProps {
  onClick: () => void
}

export const ModalBackground: React.SFC<ModalBackgroundProps> = props => {
  return <ModalBackgroundContainer onClick={props.onClick} />
}

const ModalBackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
`
