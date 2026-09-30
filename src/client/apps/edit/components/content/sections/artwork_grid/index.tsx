import { color } from "@artsy/palette"
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
import { DEFAULT_COLUMNS, OnChangeArtworkGridSection } from "./constants"

interface Props {
  editing: boolean
  onChangeSectionAction: OnChangeArtworkGridSection
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

        <ArtworkGridBody editing={editing}>
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
        </ArtworkGridBody>
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

/**
 * Layering mirrors the images section: while editing the body sits above
 * SectionContainer's fixed click-off backdrop (z-index 1) so remove buttons
 * and drag handles are reachable; otherwise it sits below the container's
 * ClickToEdit layer so clicking anywhere on the grid selects the section.
 */
export const ArtworkGridBody = styled.div<{ editing: boolean }>`
  position: relative;
  z-index: ${props => (props.editing ? 2 : -1)};
`

export const ArtworkGridList = styled.div<{ columns: number }>`
  ${props => gridStyles(props.columns)};
`

/**
 * Deliberately not positioned: SectionContainer's ClickToEdit layer is an
 * earlier absolutely-positioned sibling, and a positioned section here
 * would paint above it and swallow clicks meant to select the section.
 */
const SectionArtworkGridContainer = styled.section<{ columns: number }>`
  ${DragContainer} {
    ${props => gridStyles(props.columns)};
  }

  ${DraggableCover} {
    display: none;
  }

  /* Inside the tile corner (not overhanging) so entering edit mode does not
     need extra padding and nothing shifts. */
  ${RemoveButtonContainer} {
    position: absolute;
    top: 8px;
    right: 8px;
    height: 30px;
    width: 30px;

    /* hover the whole button, not just the circle under the X glyph */
    &:hover circle {
      fill: ${color("red100")};
    }
  }

  [data-target="true"] ${RemoveButtonContainer} {
    display: none;
  }
`
