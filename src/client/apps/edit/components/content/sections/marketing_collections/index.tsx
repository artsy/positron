// Images section supports a mix of uploaded images and artworks
import { color, Flex } from "@artsy/palette"
import {
  ArticleData,
  SectionData,
  SectionLayout,
} from "@artsy/reaction/dist/Components/Publishing/Typings"
import {
  onChangeHero,
  onChangeSection,
} from "client/actions/edit/sectionActions"
import { DragContainer } from "client/components/drag_drop2"
import { DraggableCover } from "client/components/drag_drop2/drag_source"
import { DragTargetContainer } from "client/components/drag_drop2/drag_target"
import { EditSectionPlaceholder } from "client/components/edit_section_placeholder"
import { ProgressBar } from "client/components/file_input/progress_bar"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import CollectionControls from "./components/controls"
import EditCollection, {
  EditMarketingCollectionContainer,
} from "./components/edit_marketing_collection"

interface SectionMarketingCollectionsProps {
  article: ArticleData
  editing: boolean
  onChangeHeroAction: (key: string, val: any) => void
  onChangeSectionAction: (key: string, val: any) => void
  section: SectionData
}

interface SectionMarketingCollectionsState {
  progress: number | null
}

export class SectionMarketingCollections extends Component<
  SectionMarketingCollectionsProps,
  SectionMarketingCollectionsState
> {
  state = {
    progress: null,
  }

  renderCollection = (collection, editing = false) => {
    const props = {
      collection,
      editing,
      section: this.props.section,
    }
    return <EditCollection {...props} />
  }

  render() {
    const { progress } = this.state
    const { editing, section } = this.props
    const collection = section

    return (
      <SectionMarketingCollectionsContainer sectionLayout={"column_width"}>
        {editing && (
          <CollectionControls
            section={section}
            editing={editing}
            setProgress={(val: number) => this.setState({ progress: val })}
          />
        )}

        {progress !== null && <ProgressBar progress={progress} cover />}

        <SectionMarketingCollectionsList
          justifyContent="center"
          zIndex={editing ? 2 : -1}
        >
          {collection.name ? (
            this.renderCollection(collection, true)
          ) : (
            <EditSectionPlaceholder>
              Search for Collections above
            </EditSectionPlaceholder>
          )}
        </SectionMarketingCollectionsList>
      </SectionMarketingCollectionsContainer>
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
)(SectionMarketingCollections)

const SectionMarketingCollectionsContainer = styled.section<{
  sectionLayout: SectionLayout
  isWrapping?: boolean
}>`
  .RemoveButton {
    position: absolute;
    top: -12px;
    right: -12px;
    height: 30px;
    width: 30px;
  }

  [data-target="true"] .RemoveButton {
    display: none;
  }

  ${props =>
    props.sectionLayout === "fillwidth" &&
    `
    .RemoveButton {
      top: 20px;
      right: 20px;
      circle {
        fill: ${color("black30")}
      }
      &:hover circle {
        fill: ${color("red100")};
      }
    }
  `};
`

const SectionMarketingCollectionsList = styled(Flex)<{
  isWrapping?: boolean
}>`
  position: relative;

  ${DragContainer} {
    flex-direction: row;
    justify-content: space-between;

    ${props =>
      props.isWrapping &&
      `
      flex-wrap: wrap;
    `};
  }

  ${DragTargetContainer} {
    max-width: 100%;
    margin-right: 30px;

    &:last-child {
      margin-right: 0;
    }

    ${EditMarketingCollectionContainer} {
      margin-right: 0;
    }
  }

  ${DraggableCover} {
    display: none;
  }
`
