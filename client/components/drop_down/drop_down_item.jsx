import styled, { keyframes } from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

export class DropDownItem extends Component {
  static propTypes = {
    active: PropTypes.bool,
    index: PropTypes.number.isRequired,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string,
    children: PropTypes.any
  }

  constructor (props) {
    super(props)

    this.state = {
      isActive: props.active || false
    }
  }

  render () {
    const {
      active,
      children,
      index,
      onClick,
      title
    } = this.props

    return (
      <div className='DropDownItem' key={'DropDownItem-' + index}>
        <div
          className='DropDownItem__title'
          onClick={() => onClick(index)}
          data-active={active}
        >
          <h1 className={!title && 'placeholder'}>
            {title || 'Missing Title'}
          </h1>
          <div className='icon' />
        </div>
        {active &&
          <DropDownItemContent className='DropDownItem__content'>
            {children}
          </DropDownItemContent>
        }
      </div>
    )
  }
}

const navKeyframes = keyframes`
  from {
    max-height: 0px;
    opacity: 0;
  }
  to {
    max-height: 100%;
    opacity: 1;
  }
`
const DropDownItemContent = styled.div`
  animation-name: ${navKeyframes};
  animation-duration: 1s;
  animation-timing-function: ease;
`
