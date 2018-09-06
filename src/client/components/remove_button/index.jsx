import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { IconRemove } from '@artsy/reaction/dist/Components/Publishing/Icon/IconRemove'

export const RemoveButton = props => {
  const {
    background,
    className,
    color,
    onClick,
    onMouseDown
  } = props

  return (
    <RemoveButtonContainer
      className={`RemoveButton ${className || ''}`}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      <IconRemove
        color={color}
        background={background}
      />
    </RemoveButtonContainer>
  )
}

RemoveButton.propTypes = {
  background: PropTypes.string,
  className: PropTypes.string,
  color: PropTypes.string,
  onClick: PropTypes.func,
  onMouseDown: PropTypes.func
}

export const RemoveButtonContainer = styled.div`
  cursor: pointer;
  z-index: 10;
`
