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
  fragment DisplayUnit on DisplayUnit {
    assets {
      url
    }
    body
    cover_image_url
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
