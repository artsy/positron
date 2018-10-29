import { Artwork } from "@artsy/reaction/dist/Components/Publishing/Sections/Artwork"
import { Image } from "@artsy/reaction/dist/Components/Publishing/Sections/Image"
import { SectionData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import {
  onChangeHero,
  onChangeSection,
} from "client/actions/edit/sectionActions"
import { Paragraph } from "client/components/draft/paragraph/paragraph"
import { RemoveButton } from "client/components/remove_button"
import { clone, without } from "lodash"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"

interface ArticleImage {
  url?: string
  caption?: string
  type: "image" | "artwork"
  width?: number
  height?: number
}

interface Props {
  article: any
  editing: boolean
  image: ArticleImage
  index: number
  isHero: boolean
  onChangeHeroAction: (key: string, val: any) => void
  onChangeSectionAction: (key: string, val: any) => void
  progress: number
  section: SectionData
  width: any
}

export class EditImage extends Component<Props> {
  onChange = (images: ArticleImage[]) => {
    const { isHero, onChangeHeroAction, onChangeSectionAction } = this.props

    if (isHero) {
      onChangeHeroAction("images", images)
    } else {
      onChangeSectionAction("images", images)
    }
  }

  removeImage = () => {
    const { section, image } = this.props
    const newImages = without(section.images, image)

    this.onChange(newImages)
  }

  onCaptionChange = html => {
    const { image, index, section } = this.props

    const newImages = clone(section.images)
    const newImage = Object.assign({}, image)

    newImage.caption = html
    newImages[index] = newImage

    this.onChange(newImages)
  }

  editCaption = () => {
    const { image, progress } = this.props

    if (!progress) {
      return (
        <Paragraph
          allowedStyles={["I"]}
          hasLinks
          html={image.caption || ""}
          onChange={this.onCaptionChange}
          placeholder="Image Caption"
          stripLinebreaks
        />
      )
    }
  }

  render() {
    const { article, editing, image, section, width } = this.props

    const isArtwork = image.type === "artwork"
    const isClassic = article.layout === "classic"
    const isSingle = section && section.images && section.images.length === 1

    const imgWidth = isSingle && !isClassic ? "100%" : `${width}px`

    return (
      <EditImageContainer className="EditImage" width={imgWidth}>
        {isArtwork ? (
          <Artwork
            artwork={image}
            layout={article.layout}
            linked={false}
            sectionLayout={section.layout}
            editing
          />
        ) : (
          <Image
            editCaption={this.editCaption}
            image={image}
            layout={article.layout}
            linked={false}
            sectionLayout={section.layout}
          />
        )}
        {editing && <RemoveButton onClick={this.removeImage} />}
      </EditImageContainer>
    )
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
})

const mapDispatchToProps = {
  onChangeHeroAction: onChangeHero,
  onChangeSectionAction: onChangeSection,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditImage)

const EditImageContainer = styled.div<{ width: string }>`
  width: ${props => props.width};
`
