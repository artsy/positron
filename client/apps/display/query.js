export const displayFragment = `
  fragment on DisplayUnit {
    assets {
      url
    }
    body
    disclaimer
    headline
    layout
    link {
      text
      url
    }
    logo
    name
  }
`

export const displayQuery = (fragment) => {
  return `
    {
      display {
        name
        canvas {
          ...${fragment}
        }
        panel {
          ...${fragment}
        }
      }
    }
  `
}
