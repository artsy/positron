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
  EditCollectionContainer,
} from "./components/edit_collection"

interface SectionCollectionsProps {
  article: ArticleData
  editing: boolean
  // isHero: boolean
  onChangeHeroAction: (key: string, val: any) => void
  onChangeSectionAction: (key: string, val: any) => void
  section: SectionData
}

interface SectionCollectionsState {
  progress: number | null
}

export class SectionCollections extends Component<
  SectionCollectionsProps,
  SectionCollectionsState
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
    const { editing, isHero, section } = this.props
    const collection = section

    return (
      <SectionCollectionsContainer sectionLayout={"column_width"}>
        {editing && (
          <CollectionControls
            section={section}
            editing={editing}
            isHero={isHero}
            setProgress={(val: number) => this.setState({ progress: val })}
          />
        )}

        {progress !== null && <ProgressBar progress={progress} cover />}

        <SectionCollectionsList
          justifyContent="center"
          zIndex={editing ? 2 : -1}
        >
          {collection.display ? (
            this.renderCollection(collection, true)
          ) : (
            <EditSectionPlaceholder>
              Search for Collections above
            </EditSectionPlaceholder>
          )}
        </SectionCollectionsList>
      </SectionCollectionsContainer>
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
)(SectionCollections)

const SectionCollectionsContainer = styled.section<{
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

const SectionCollectionsList = styled(Flex)<{
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

    ${EditCollectionContainer} {
      margin-right: 0;
    }
  }

  ${DraggableCover} {
    display: none;
  }
`
