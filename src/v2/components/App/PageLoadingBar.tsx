import React, { useState, useEffect, useRef } from "react"
import styled, { keyframes, css } from "styled-components"
import { Box } from "@artsy/palette"
import { Z } from "utils/constants"

interface PageLoadingBarProps {
  loadingState: "resting" | "loading" | "complete"
}

export const PageLoadingBar: React.FC<PageLoadingBarProps> = ({
  loadingState = "resting",
}) => {
  const [isComplete, setIsComplete] = useState(false)
  const [loading, setLoading] = useState(loadingState)
  const [scaleX, setScaleX] = useState(0)

  const barRef = useRef<HTMLDivElement>(null)

  useEffect(
    () => {
      if (loadingState === "complete") {
        setIsComplete(true)
        setLoading("complete")
        setScaleX(1)
      } else {
        setIsComplete(false)
        setLoading(loadingState)
        setScaleX(loadingState === "loading" ? 0.3 : 0)
      }
    },
    [loadingState]
  )

  return (
    <Box position="fixed" top={0} left={0} zIndex={100} width="100%" height={3}>
      <LoadingBar
        ref={barRef as any}
        loading={loading}
        isComplete={isComplete}
        scaleX={scaleX}
        backgroundColor="brand"
        height={2}
        top="1px"
        left="0px"
        zIndex={Z.loadingBar}
        overflow="hidden"
        position="fixed"
        onAnimationEnd={() => {
          if (isComplete) {
            setLoading("resting")
            setIsComplete(false)
            setScaleX(0)
          }
        }}
      />
    </Box>
  )
}

const startEase = "cubic-bezier(0.000, 0.925, 0.000, 0.80)"
const easeOutExpo = "cubic-bezier(0.19, 1, 0.22, 1)"

const loadingAnimation = keyframes`
  from {
    transform: translateX(-10%) scaleX(0);
  }
  to {
    transform: translateX(0) scaleX(0.3);
  }
`

const completeAnimation = keyframes`
  to {
    transform: scaleX(1);
  }
`

const fadeInAnimation = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 1;
  }
`

const LoadingBar = styled(Box)<{
  loading: string
  isComplete: boolean
  scaleX: number
}>`
  transform-origin: left;
  transform: scaleX(${({ scaleX }) => scaleX});
  ${({ loading }) =>
    loading === "loading" &&
    css`
      animation: ${loadingAnimation} 12s ${startEase} forwards,
        ${fadeInAnimation} 0.1s linear;
    `}
  ${({ isComplete }) =>
    isComplete &&
    css`
      animation: ${completeAnimation} 1s ${easeOutExpo} forwards;
    `}
  opacity: ${({ isComplete }) => (isComplete ? 0 : 1)};
  width: 100%;
  transition:
    opacity 0.7s,
    transform 0.7s;
`
