import { Box, Col, Flex } from "@artsy/palette"
import { Input } from "@artsy/reaction/dist/Components/Input"
import {
  ArticleData,
  SectionData,
} from "@artsy/reaction/dist/Components/Publishing/Typings"
import { logError } from "client/actions/edit/errorActions"
import {
  onChangeHero,
  onChangeSection,
  removeSection,
} from "client/actions/edit/sectionActions"
// import SectionControls from "client/apps/edit/components/content/section_controls"
import { Autocomplete } from "client/components/autocomplete2"
import FileInput from "client/components/file_input"
import { FormLabel } from "client/components/form_label"
import { clone, difference } from "lodash"
import React, { Component } from "react"
import { connect } from "react-redux"
import { data as sd } from "sharify"
import styled from "styled-components"
import SectionControls from "../../../section_controls/index.tsx"
import { InputArtworkUrl } from "./input_artwork_url"
const Artwork = require("client/models/artwork.coffee")

interface ImagesControlsProps {
  article: ArticleData
  isHero: boolean
  logErrorAction: (e: any) => void
  onChangeHeroAction: (key: string, val: any) => void
  onChangeSectionAction: (key: string, val: any) => void
  removeSectionAction: (i: number) => void
  editSection: any
  section: SectionData
  sectionIndex: number
  setProgress: (progress: number) => void
}

export class ImagesControls extends Component<ImagesControlsProps> {
  componentWillUnmount = () => {
    const {
      removeSectionAction,
      editSection,
      isHero,
      sectionIndex,
    } = this.props

    if (!isHero && !editSection.images.length) {
      removeSectionAction(sectionIndex)
    }
  }

  filterAutocomplete = items => {
    return items._embedded.results.map(item => {
      const { type } = item

      if (type && type.toLowerCase() === "artwork") {
        const { title, _links } = item
        const { thumbnail, self } = _links
        const _id = self.href.substr(self.href.lastIndexOf("/") + 1)
        const thumbnail_image = thumbnail && thumbnail.href

        return {
          _id,
          title,
          thumbnail_image,
          type,
        }
      } else {
        return false
      }
    })
  }

  fetchDenormalizedArtwork = async id => {
    const { logErrorAction } = this.props

    try {
      const artwork = await new Artwork({ id }).fetch()
      return new Artwork(artwork).denormalized()
    } catch (err) {
      logErrorAction({ message: "Artwork not found." })
      return err
    }
  }

  onNewImage = image => {
    const {
      article: { layout },
      editSection,
      isHero,
      section,
      onChangeHeroAction,
      onChangeSectionAction,
    } = this.props
    let newImages

    if (isHero) {
      newImages = clone(section.images).concat(image)
      onChangeHeroAction("images", newImages)
    } else {
      if (layout === "news") {
        newImages = [image]
      } else {
        newImages = clone(editSection.images).concat(image)
      }
      onChangeSectionAction("images", newImages)
    }
  }

  onUpload = (image, width, height) => {
    this.onNewImage({
      url: image,
      type: "image",
      width,
      height,
      caption: "",
    })
  }

  onSelectArtwork = images => {
    const {
      article: { layout },
      editSection,
      onChangeSectionAction,
    } = this.props

    if (layout === "news") {
      const existingImages = clone(editSection.images) || []
      const newImages = difference(images, existingImages)
      onChangeSectionAction("images", newImages)
    } else {
      onChangeSectionAction("images", images)
    }
  }

  inputsAreDisabled = () => {
    const { editSection, isHero } = this.props

    return (
      !isHero &&
      editSection.layout === "fillwidth" &&
      editSection.images.length > 0
    )
  }

  fillWidthAlert = () => {
    const { logErrorAction } = this.props
    const message =
      "Fullscreen layouts accept one asset, please remove extra images or use another layout."

    logErrorAction({ message })
  }

  render() {
    const {
      article,
      isHero,
      onChangeSectionAction,
      editSection,
      setProgress,
    } = this.props

    const inputsAreDisabled = this.inputsAreDisabled()
    const section = isHero ? article.hero_section : editSection
    const isNews = article.layout === "news"

    return (
      <SectionControls
        showLayouts={!isHero && !isNews}
        isHero={isHero}
        disabledAlert={this.fillWidthAlert}
      >
        <Box
          onClick={inputsAreDisabled ? this.fillWidthAlert : undefined}
          pt={isNews || isHero ? 1 : 0}
        >
          <FileInput
            disabled={inputsAreDisabled}
            onProgress={setProgress}
            onUpload={this.onUpload}
          />
        </Box>

        {!isHero && (
          <ArtworkInputs
            pt={1}
            onClick={inputsAreDisabled ? this.fillWidthAlert : undefined}
          >
            <Col xs={6} pr={1}>
              <Autocomplete
                disabled={inputsAreDisabled}
                filter={this.filterAutocomplete}
                formatSelected={item => this.fetchDenormalizedArtwork(item._id)}
                items={section.images || []}
                onSelect={this.onSelectArtwork}
                placeholder="Search artworks by title..."
                url={`${sd.ARTSY_URL}/api/search?q=%QUERY`}
              />
            </Col>
            <Col xs={6} pl={1} pt={1}>
              <InputArtworkUrl
                addArtwork={this.onNewImage}
                fetchArtwork={this.fetchDenormalizedArtwork}
                disabled={inputsAreDisabled}
              />
            </Col>
          </ArtworkInputs>
        )}

        {!isHero &&
          section.type === "image_set" && (
            <ArtworkInputs pt={1}>
              <Col xs={6} pr={1}>
                <Input
                  defaultValue={section.title}
                  onChange={e => {
                    onChangeSectionAction("title", e.currentTarget.value)
                  }}
                  placeholder="Image Set Title (optional)"
                />
              </Col>
              <Col xs={6} pl={1}>
                <Flex height="100%" alignItems="center">
                  <FormLabel color="white">Entry Point:</FormLabel>
                  <Flex pl={2}>
                    <Flex alignItems="center" pr={2}>
                      <RadioInput
                        onClick={() => onChangeSectionAction("layout", "mini")}
                        isActive={section.layout !== "full"}
                      />
                      <FormLabel color="white">Mini</FormLabel>
                    </Flex>
                    <Flex alignItems="center" pr={2}>
                      <RadioInput
                        onClick={() => onChangeSectionAction("layout", "full")}
                        isActive={section.layout === "full"}
                      />
                      <FormLabel color="white">Full</FormLabel>
                    </Flex>
                  </Flex>
                </Flex>
              </Col>
            </ArtworkInputs>
          )}
      </SectionControls>
    )
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
  editSection: state.edit.section,
  sectionIndex: state.edit.sectionIndex,
})

const mapDispatchToProps = {
  logErrorAction: logError,
  onChangeHeroAction: onChangeHero,
  onChangeSectionAction: onChangeSection,
  removeSectionAction: removeSection,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImagesControls)

export const ArtworkInputs = styled(Flex)`
  input {
    margin-bottom: 0;
  }
`

// TODO: Use palette radios
export const RadioInput = styled.div<{ isActive: boolean }>`
  border: 2px solid white;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 10px;
  position: relative;

  ${props =>
    props.isActive &&
    `
    &::after {
      content: "";
      background: white;
      width: 0.5em;
      height: 0.5em;
      border-radius: 50%;
      border: 1px solid black;
      position: absolute;
      left: 1px;
      top: 1px;
    }
  `};
`
