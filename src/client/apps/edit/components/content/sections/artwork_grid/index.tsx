import { onChangeSection } from "client/actions/edit/sectionActions"
import { DragContainer, DragDropList } from "client/components/drag_drop2"
import { DraggableCover } from "client/components/drag_drop2/drag_source"
import { EditSectionPlaceholder } from "client/components/edit_section_placeholder"
import { RemoveButtonContainer } from "client/components/remove_button"
import { ArtworkGridArtwork, SectionData } from "client/typings/sections"
import { without } from "lodash"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import { ArtworkGridItem } from "./components/artwork_grid_item"
import ArtworkGridControls from "./components/controls"
import { DEFAULT_COLUMNS } from "./constants"

interface Props {
  editing: boolean
  onChangeSectionAction: (key: string, val: any) => void
  section: SectionData
}

/**
 * Editor for the `artwork_grid` section: a CSS grid of curated artworks
 * with a configurable column count. Editors can reorder (drag) and remove
 * artworks here; the picker and column controls are in ./components/controls.
 */
export class SectionArtworkGrid extends Component<Props> {
  getArtworks = (): ArtworkGridArtwork[] => {
    return this.props.section.artworks || []
  }

  onChangeArtworks = (artworks: ArtworkGridArtwork[]) => {
    this.props.onChangeSectionAction("artworks", artworks)
  }

  removeArtwork = (artwork: ArtworkGridArtwork) => {
    this.onChangeArtworks(without(this.getArtworks(), artwork))
  }

  renderItems = (editing: boolean) => {
    return this.getArtworks().map((artwork, index) => (
      <ArtworkGridItem
        key={artwork.id || index}
        artwork={artwork}
        editing={editing}
        isDraggable={editing}
        onRemove={() => this.removeArtwork(artwork)}
      />
    ))
  }

  render() {
    const { editing, section } = this.props
    const artworks = this.getArtworks()
    const columns = section.columns || DEFAULT_COLUMNS

    return (
      <SectionArtworkGridContainer columns={columns}>
        {editing && <ArtworkGridControls />}

        {artworks.length === 0 ? (
          <EditSectionPlaceholder>Add artworks above</EditSectionPlaceholder>
        ) : editing && artworks.length > 1 ? (
          <DragDropList
            items={artworks}
            onDragEnd={this.onChangeArtworks}
            isDraggable
            isWrapping
          >
            {this.renderItems(true)}
          </DragDropList>
        ) : (
          <ArtworkGridList columns={columns}>
            {this.renderItems(editing)}
          </ArtworkGridList>
        )}
      </SectionArtworkGridContainer>
    )
  }
}

const mapDispatchToProps = {
  onChangeSectionAction: onChangeSection,
}

export default connect(
  null,
  mapDispatchToProps
)(SectionArtworkGrid)

const gridStyles = (columns: number) => `
  display: grid;
  grid-template-columns: repeat(${columns}, minmax(0, 1fr));
  grid-gap: 20px;
  width: 100%;
`

export const ArtworkGridList = styled.div<{ columns: number }>`
  ${props => gridStyles(props.columns)};
`

const SectionArtworkGridContainer = styled.section<{ columns: number }>`
  position: relative;

  ${DragContainer} {
    ${props => gridStyles(props.columns)};
  }

  ${DraggableCover} {
    display: none;
  }

  ${RemoveButtonContainer} {
    position: absolute;
    top: -12px;
    right: -12px;
    height: 30px;
    width: 30px;
  }

  [data-target="true"] ${RemoveButtonContainer} {
    display: none;
  }
`
