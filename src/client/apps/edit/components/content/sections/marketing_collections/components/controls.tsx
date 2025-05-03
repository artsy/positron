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

interface MarketingCollectionsControlsProps {
  article: ArticleData
  logErrorAction: (e: any) => void
  onChangeHeroAction: (key: string, val: any) => void
  onChangeSectionAction: (key: string, val: any) => void
  removeSectionAction: (i: number) => void
  editSection: any
  section: SectionData
  sectionIndex: number
  setProgress: (progress: number) => void
}

export class MarketingCollectionsControls extends Component<MarketingCollectionsControlsProps> {
  componentWillUnmount = () => {
    const {
      removeSectionAction,
      editSection,
      sectionIndex,
    } = this.props

    // Breadcrumb: removed !isHero conditional
    if (!editSection.collection) {
      // Come back to this 
      removeSectionAction(sectionIndex)
    }
  }

  returnSelected = item => {
    const { id, name, image_url } = item
    return {
      slug: id,
      name,
      image_url,
    }
  }

  returnItems = items => {
    return items.map(item => {
      return {
        id: item.id,
        name: item.name,
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
        <div>{searchResult.name}</div>
      </>
    )
  }

  onSelectCollection = collection => {
    const {
      onChangeSectionAction,
    } = this.props
    const newCollection = clone(collection)
    // TODO: Figure out why both are necessary for this to work.
    Object.keys(newCollection).forEach(key => {
      onChangeSectionAction(key, newCollection[key])
    })
    onChangeSectionAction("marketing_collection", newCollection)
  }


  render() {
    return (
      <SectionControls>
      <ArtworkInputs pt={1} onClick={undefined}>
          <Col xs={6} pr={1}>
            <Autocomplete
              filter={this.returnItems}
              formatSelected={this.returnSelected}
              formatSearchResult={this.formatResult}
              onSelect={this.onSelectCollection}
              placeholder="Search collections by title..."
              url={`${
                sd.ARTSY_URL
              }/api/v1/match?term=%QUERY&indexes=MarketingCollection`}
              returnType="single"
            />
          </Col>
          <Col xs={6} pl={1} pt={1}>
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
)(MarketingCollectionsControls)

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
