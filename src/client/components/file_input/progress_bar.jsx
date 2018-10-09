import colors from "@artsy/reaction/dist/Assets/Colors"
import styled from "styled-components"
import PropTypes from "prop-types"
import React from "react"

export const ProgressBar = props => {
  const { color, cover, progress } = props

  return (
    <ProgressContainer className="ProgressBar" cover={cover}>
      <Progress
        className="ProgressBar__bar"
        color={color}
        progress={progress}
      />
    </ProgressContainer>
  )
}

ProgressBar.propTypes = {
  color: PropTypes.string,
  cover: PropTypes.bool,
  progress: PropTypes.number,
}

ProgressBar.defaultProps = {
  color: colors.purpleRegular,
}

const ProgressContainer = styled.div`
  width: 100%;
  background-color: white;
  ${props =>
    props.cover &&
    `
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    z-index: 3;
    background: rgba(255,255,255,.75);
    padding: 20px;
  `};
`

const Progress = styled.div`
  height: 5px;
  width: ${props => props.progress * 100}%;
  background-color: ${props => props.color};
`
