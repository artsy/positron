import React from "react"
import styled from "styled-components"

interface ModalCoverProps {
  onClick: () => void
}

export const ModalCover: React.SFC<ModalCoverProps> = props => {
  return <ModalCoverContainer onClick={props.onClick} />
}

const ModalCoverContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
`
