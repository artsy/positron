import PropTypes from "prop-types"
import React from "react"
import { ImageSetPreview } from "@artsy/reaction/dist/Components/Publishing/Sections/ImageSetPreview"
import { ImageSetPreviewClassic } from "@artsy/reaction/dist/Components/Publishing/Sections/ImageSetPreview/ImageSetPreviewClassic"

export const ImageSet = props => {
  const { articleLayout, section } = props
  const { layout, title } = section
  const images = section.images || []
  let itemProps = {}

  if (articleLayout === "classic") {
    itemProps = { images }

    return <ImageSetPreviewClassic {...itemProps} />
  } else {
    itemProps.section = {
      images,
      layout,
      title,
    }

    return <ImageSetPreview {...itemProps} />
  }
}

ImageSet.propTypes = {
  articleLayout: PropTypes.string.isRequired,
  section: PropTypes.object.isRequired,
}
