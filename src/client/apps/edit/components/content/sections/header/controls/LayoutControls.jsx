import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { IconLayoutFullscreen } from '@artsy/reaction/dist/Components/Publishing/Icon/IconLayoutFullscreen'
import { IconLayoutSplit } from '@artsy/reaction/dist/Components/Publishing/Icon/IconLayoutSplit'
import { IconLayoutText } from '@artsy/reaction/dist/Components/Publishing/Icon/IconLayoutText'
import { IconLayoutBasic } from '@artsy/reaction/dist/Components/Publishing/Icon/IconLayoutBasic'

export class LayoutControls extends Component {
  render() {
    const { hero, isOpen, onClick, onChange } = this.props

    return (
      <div className='edit-header--controls'>
        <div className='edit-header--controls__menu'>
          <OpenControlsContainer
            onClick={onClick}
            className='edit-header--controls-open'
            color={getControlsColor(hero)}
          >
            Change Header
          </OpenControlsContainer>

          {isOpen &&
            <div className='edit-header--controls__layout'>
              <a
                onClick={() => onChange('type', 'text')}
                name='text'
              >
                <IconLayoutText />
                Default
              </a>
              <a
                onClick={() => onChange('type', 'fullscreen')}
                name='fullscreen'
              >
                <IconLayoutFullscreen />
                Overlay
              </a>
              <a
                onClick={() => onChange('type', 'split')}
                name='split'
              >
                <IconLayoutSplit />
                Split
              </a>
              <a
                onClick={() => onChange('type', 'basic')}
                name='basic'
              >
                <IconLayoutBasic />
                Basic
              </a>
            </div>
          }
        </div>
      </div>
    )
  }
}

LayoutControls.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  hero: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired
}

export const OpenControlsContainer = styled.div`
  color: ${props => props.color};
`

const getControlsColor = hero => {
  const { type, url } = hero

  if (hero && type === 'fullscreen' && url && url.length) {
    return 'white'
  } else {
    return 'black'
  }
}
