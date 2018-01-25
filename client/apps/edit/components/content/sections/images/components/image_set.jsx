import PropTypes from 'prop-types'
import React from 'react'
import {
  ImageSetPreview,
  ImageSetPreviewClassic
} from '@artsy/reaction-force/dist/Components/Publishing'

export const ImageSet = (props) => {
  const { articleLayout, section } = props
  const images = section.get('images') || []
  let itemProps = {}

  if (articleLayout === 'classic') {
    itemProps = { images }

    return (
      <ImageSetPreviewClassic {...itemProps} />
    )
  } else {
    itemProps.section = {
      images,
      layout: section.get('layout'),
      title: section.get('title')
    }

    return (
      <ImageSetPreview {...itemProps} />
    )
  }
}

ImageSet.propTypes = {
  articleLayout: PropTypes.string.isRequired,
  section: PropTypes.object.isRequired
}
