import colors from '@artsy/reaction-force/dist/Assets/Colors'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'

export const ProgressBar = (props) => {
  const { color, progress } = props

  return (
    <ProgressContainer className='ProgressBar'>
      <Progress
        className='ProgressBar__bar'
        color={color}
        progress={progress}
      />
    </ProgressContainer>
  )
}

ProgressBar.propTypes = {
  color: PropTypes.string,
  progress: PropTypes.number
}

ProgressBar.defaultProps = {
  color: colors.purpleRegular
}

const ProgressContainer = styled.div`
  width: 100%;
  background-color: white;
`

const Progress = styled.div`
  height: 5px;
  width: ${props => props.progress * 100}%;
  background-color: ${props => props.color};
`
