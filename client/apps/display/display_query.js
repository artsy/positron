export const DisplayQuery = `
  {
    display {
      name
      canvas {
        ...DisplayUnit
      }
      panel {
        ...DisplayUnit
      }
    }
  }
`
