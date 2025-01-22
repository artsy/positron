import { Col, Flex } from "@artsy/palette"
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
import SectionControls from "client/apps/edit/components/content/section_controls"
import {
  Autocomplete,
  AutocompleteResultImg,
  SearchResultItem,
} from "client/components/autocomplete2"
import { clone } from "lodash"
import React, { Component } from "react"
import { connect } from "react-redux"
import { data as sd } from "sharify"
import styled from "styled-components"
const Collection = require("client/models/collection.coffee")

interface CollectionsControlsProps {
  article: ArticleData
  // isHero: boolean
  logErrorAction: (e: any) => void
  onChangeHeroAction: (key: string, val: any) => void
  onChangeSectionAction: (key: string, val: any) => void
  removeSectionAction: (i: number) => void
  editSection: any
  section: SectionData
  sectionIndex: number
  setProgress: (progress: number) => void
}

export class CollectionsControls extends Component<CollectionsControlsProps> {
  componentWillUnmount = () => {
    const {
      removeSectionAction,
      editSection,
      isHero,
      sectionIndex,
    } = this.props

    if (!isHero && !editSection.collection) {
      removeSectionAction(sectionIndex)
    }
  }

  fetchDenormalizedCollection = async id => {
    const { logErrorAction } = this.props

    try {
      const collection = await new Collection({ id }).fetch()
      const coll = new Collection(collection).denormalized()
      return coll
    } catch (err) {
      logErrorAction({ message: "Collection not found." })
      return err
    }
  }

  returnSelected = item => {
    const { id, display, image_url } = item
    return {
      slug: id,
      display,
      image_url,
    }
  }

  returnItems = items => {
    return items.map(item => {
      return {
        id: item.id,
        display: item.display,
        image_url: item.image_url,
      }
    })
  }

  formatResult = (searchResult: SearchResultItem) => {
    return (
      <>
        <AutocompleteResultImg width={45} height={45} mr={15}>
          {searchResult.image_url && <img src={searchResult.image_url || ""} />}
        </AutocompleteResultImg>
        <div>{searchResult.display}</div>
      </>
    )
  }

  onSelectCollection = collection => {
    const {
      // article: { layout },
      editSection,
      onChangeSectionAction,
    } = this.props
    // console.log("####################################")
    // const newCollection = clone(editSection)
    // const value = { ...newCollection, ...collection }
    // console.log("value", value)
    const newCollection = clone(collection)
    // console.log("newCollection", newCollection)
    Object.keys(newCollection).forEach(key => {
      onChangeSectionAction(key, newCollection[key])
    })
    // // BREADCRUMB
    onChangeSectionAction("collection", newCollection)
  }

  // fillWidthAlert = () => {
  //   const { logErrorAction } = this.props
  //   const message =
  //     "Fullscreen layouts accept one asset, please remove extra images or use another layout."

  //   logErrorAction({ message })
  // }

  render() {
    const {
      // isHero,
       editSection
    } = this.props

    // const section = editSection

    return (
      <SectionControls
        // showLayouts={false}
        // isHero={false} // TODO: Remove?
        // disabledAlert={this.fillWidthAlert}
      >
      <ArtworkInputs pt={1} onClick={undefined}>
          <Col xs={6} pr={1}>
            <Autocomplete
              filter={this.returnItems}
              formatSelected={this.returnSelected}
              formatSearchResult={this.formatResult}
              // items={section.collection || []}
              onSelect={this.onSelectCollection}
              placeholder="Search collections by title..."
              url={`${
                sd.ARTSY_URL
              }/api/v1/match?term=%QUERY&indexes=MarketingCollection`}
              returnType="single"
            />
          </Col>
          <Col xs={6} pl={1} pt={1}>
            {/* <InputArtworkUrl
              addArtwork={this.onNewImage}
              fetchArtwork={this.fetchDenormalizedCollection}
              disabled={inputsAreDisabled}
            /> */}
          </Col>
        </ArtworkInputs>
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
)(CollectionsControls)

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
