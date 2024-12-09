import {
  ImageSetPreview,
  ImageSetPreviewProps,
} from "@artsy/reaction/dist/Components/Publishing/Sections/ImageSetPreview"
import { ImageSetPreviewClassic } from "@artsy/reaction/dist/Components/Publishing/Sections/ImageSetPreview/ImageSetPreviewClassic"
import { ArticleLayout } from "@artsy/reaction/dist/Components/Publishing/Typings"
import React from "react"

export interface ImageSetProps extends ImageSetPreviewProps {
  articleLayout: ArticleLayout
}

export const ImageSet: React.SFC<ImageSetProps> = props => {
  const { articleLayout, section } = props
  const images = section.images || []

  if (articleLayout === "classic") {
    return <ImageSetPreviewClassic images={images} />
  } else {
    return <ImageSetPreview section={section} />
  }
}
