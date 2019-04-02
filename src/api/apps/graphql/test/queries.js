const sectionFragments = `
  fragment Image on Image {
    url
    caption
    type
    width
    height
  }
  fragment Video on Video {
    caption
    type
    url
    cover_image_url
    layout
    background_color
  }
  fragment Artwork on Artwork {
    type
    id
    slug
    image
    title
    date
    partner {
      name
      slug
    }
    artists {
      name
      slug
    }
    artist {
      name
      slug
    }
    width
    height
  }
`

export const ArticleSectionsQuery = `
  {
    articles(published: true) {
      sections {
        ... on Text {
          type
          body
        }
        ... on Embed {
          type
          url
          height
          mobile_height
          layout
        }
        ...Video
        ... on Callout {
          type
        }
        ... on ImageCollection {
          type
          layout
          images {
            ...Artwork
            ...Image
          }
        }
        ... on ImageSet {
          type
          title
          layout
          images {
            ...Image
            ...Artwork
          }
        }
      }
    }
  }
  ${sectionFragments}
`

export const RelatedArticlesCanvasQuery = `
  {
    articles(published: true) {
      title
      id
      channel_id
      vertical {
        id
        name
      }
      relatedArticlesCanvas {
        title
        authors {
          name
        }
      }
    }
  }
`

export const RelatedArticlesQuery = `
  {
    articles(published: true) {
      title
      id
      channel_id
      vertical {
        id
        name
      }
      relatedArticles {
        title
        authors {
          name
        }
      }
    }
  }
`
