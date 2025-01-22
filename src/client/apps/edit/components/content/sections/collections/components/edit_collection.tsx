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

export interface ArticleImage {
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
  isDraggable?: boolean
  onChangeSectionAction: (key: string, val: any) => void
  progress: number
  section: SectionData
  width: any
}

export class EditCollection extends Component<Props> {
  onChange = (collection: ArticleImage[]) => {
    const { onChangeSectionAction } = this.props
    onChangeSectionAction("collection", collection)
  }

  removeImage = () => {
    const { section } = this.props
    const newCollection = clone(section)

    this.onChange(newCollection)
  }

  onCaptionChange = (html: string) => {
    const { image, index, section } = this.props

    const newCollection = clone(section)
    const newImage = Object.assign({}, image)

    newImage.caption = html || ""
    newCollection[index] = newImage

    this.onChange(newCollection)
  }

  editCaption = () => {
    const { section, progress } = this.props

    if (!progress) {
      return (
        <Paragraph
          allowedStyles={["I"]}
          hasLinks
          // TODO: fix section ty
          html={section.display || ""}
          onChange={this.onCaptionChange}
          placeholder={section.caption}
          stripLinebreaks
        />
      )
    }
  }

  render() {
    const { article, editing, section } = this.props
    // const image = {
    //   url: section.image_url,
    //   type: "image",
    //   width: 400,
    // }
    return (
      <EditCollectionContainer width={"100%"}>
        <div>
          <p>{section.display}</p>
          <div style={{margin: 20}}/>
          <img src={section.image_url} height={100}/>
        </div>
        {/* <Image
          editCaption={this.editCaption}
          width={400}
          image={image}
          layout={article.layout}
          linked={false}
          sectionLayout={"overflow_fillwidth"}
        /> */}
        {/* {editing && <RemoveButton onClick={this.removeImage} />} */}
      </EditCollectionContainer>
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
)(EditCollection)

export const EditCollectionContainer = styled.div<{ width?: any }>`
  width: ${props => props.width || "100%"};
  position: relative;
  max-width: 100%;
  margin-right: 30px;

  &:last-child {
    margin-right: 0;
  }
`
